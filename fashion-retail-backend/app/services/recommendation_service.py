#fashion-retail-backend/app/services/reccomendation_service.py
import torch
import clip
import faiss
import pickle
import numpy as np
from PIL import Image
import io
import os
from app.config import settings

class RecommendationService:
    def __init__(self):
        self.model = None
        self.preprocess = None
        self.index = None
        self.article_ids = None
        self.device = "cpu" # Force CPU on Mac

    def load_model(self):
        print(f" Loading Visual Engine (CLIP & FAISS)...")
        try:
            # 1. Load CLIP
            # We use jit=False to ensure compatibility on some systems
            self.model, self.preprocess = clip.load("ViT-B/32", device=self.device, jit=False)
            
            # 2. Load FAISS Index
            if os.path.exists(settings.FAISS_PATH):
                self.index = faiss.read_index(settings.FAISS_PATH)
            else:
                print(f"FAISS Index not found at {settings.FAISS_PATH}")

            # 3. Load ID Mapping
            if os.path.exists(settings.IDS_PATH):
                with open(settings.IDS_PATH, "rb") as f:
                    self.article_ids = pickle.load(f)
            else:
                print(f" ID Mapping not found at {settings.IDS_PATH}")
                
            print(" Visual Engine Loaded.")
        except Exception as e:
            print(f" Error loading Visual Engine: {e}")

    def search(self, image_bytes, k=5):
        """
        Takes raw image bytes, converts to vector, searches FAISS.
        """
        # LAZY LOAD
        if self.model is None:
            print("⚠️ Lazy Loading Visual Engine...")
            self.load_model()
        if self.model is None or self.index is None:
            return {"error": "Visual Engine not loaded"}

        try:
            # 1. Preprocess Image
            image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
            image_input = self.preprocess(image).unsqueeze(0).to(self.device)

            # 2. Generate Vector
            with torch.no_grad():
                image_features = self.model.encode_image(image_input)
                # Normalize
                image_features /= image_features.norm(dim=-1, keepdim=True)
            
            # 3. Search FAISS
            query_vector = image_features.cpu().numpy().astype('float32')
            distances, indices = self.index.search(query_vector, k)

            # 4. Format Results
            results = []
            for i in range(k):
                idx = indices[0][i]
                score = float(distances[0][i])
                
                if self.article_ids and idx < len(self.article_ids):
                    raw_id = str(self.article_ids[idx])
                    
                    # FIX: Add leading zero to make it 10 digits (Standard H&M format)
                    article_id = raw_id.zfill(10)
                    
                    # Logic: The first 3 digits usually determine the folder on older H&M datasets
                    folder = article_id[:3]
                                   
                    # USE THIS NEW LINE INSTEAD:
                    img_url = f"https://placehold.co/400x600/1f2937/white?text=Item+{article_id}"
                    
                    results.append({
                        "article_id": article_id,
                        "score": round(score, 2),
                        "image_url": img_url 
                    })
            
            return results

        except Exception as e:
            print(f"Search Error: {e}")
            return {"error": f"Search Failed: {str(e)}"}


recommender = RecommendationService()