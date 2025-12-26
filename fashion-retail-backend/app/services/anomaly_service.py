#fashion-retail-backend/app/services/anomaly_service.py
import torch
import torch.nn as nn
import numpy as np
import os
from app.config import settings

class AnomalyService:
    def __init__(self):
        self.model = None
        self.threshold = 2.0 # Threshold from our Kaggle analysis
        
    def load_model(self):
        print(f"⏳ Loading Anomaly Detector from {settings.ANOMALY_PATH}...")
        try:
            # 1. Define Architecture (Must match Kaggle exactly)
            self.model = nn.Sequential(
                nn.Linear(2, 1), # Input: [Volume, Lag_7]
                nn.Tanh(),
                nn.Linear(1, 2)  # Reconstruction
            )
            
            # 2. Load Weights
            if os.path.exists(settings.ANOMALY_PATH):
                state_dict = torch.load(settings.ANOMALY_PATH, map_location='cpu')
                self.model.load_state_dict(state_dict)
                self.model.eval()
                print("✅ Anomaly Detector Loaded.")
            else:
                print(f"⚠️ Anomaly model file not found at {settings.ANOMALY_PATH}")
                
        except Exception as e:
            print(f"❌ Error loading Anomaly Model: {e}")

    def detect(self, transactions: list):
        """
        Input: List of {"sales": 50, "lag_7": 45}
        Output: List of {"status": "OK", "score": 0.1}
        """
        # ⚠️ LAZY LOAD: If model isn't loaded, load it now!
        if self.model is None:
            print("⚠️ Lazy Loading Anomaly Detector...")
            self.load_model()

        # If it's STILL None after trying to load, return error (but ideally this won't happen)
        if self.model is None:
            return [{"error": "Anomaly Model could not be loaded", "status": "CRITICAL", "sales": 0, "reconstruction_error": 0}]

        results = []
        
        for tx in transactions:
            try:
                sales = float(tx.get('sales', 0))
                lag = float(tx.get('lag_7', 0))

                # Normalization Logic (Calibrated)
                vol_norm = sales / 50.0 
                lag_norm = lag / 50.0
                
                input_tensor = torch.FloatTensor([[vol_norm, lag_norm]])
                
                # Inference
                with torch.no_grad():
                    reconstruction = self.model(input_tensor)
                    loss = torch.mean((input_tensor - reconstruction)**2).item()
                
                # Threshold Check
                status = "CRITICAL" if loss > 0.5 else "OK"
                
                results.append({
                    "sales": sales,
                    "reconstruction_error": round(loss, 4),
                    "status": status
                })
                
            except Exception as e:
                results.append({"error": str(e), "status": "ERROR"})
            
        return results


watchdog = AnomalyService()