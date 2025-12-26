
import pandas as pd
import numpy as np
import faiss
import re
import os
from functools import lru_cache
from sentence_transformers import SentenceTransformer
from groq import Groq
from app.config import settings

class ChatService:
    def __init__(self):
        self.df = None
        self.model = None
        self.index = None
        self.dims = 384
        
        self.groq_client = Groq(
            api_key=os.environ.get("GROQ_API_KEY", "YOUR_API_KEY_HERE")
        )

    def load_resources(self):
        print("💬 Loading Chat Engine (SBERT + FAISS)...")
        try:
            self.df = pd.read_csv(settings.ARTICLES_PATH)
            self.df['article_id'] = self.df['article_id'].astype(str).str.zfill(10)
            
            # Load SBERT
            self.model = SentenceTransformer('all-MiniLM-L6-v2')
            
            # Build Text Index
            print("   - Building Vector Index...")
            # We include 'index_group_name' (Menswear/Ladieswear) in the text for better matching
            text_data = (
                self.df['prod_name'] + " " + 
                self.df['detail_desc'] + " " + 
                self.df['colour_group_name'] + " " +
                self.df['index_group_name'] 
            ).fillna("").tolist()
            
            embeddings = self.model.encode(text_data, convert_to_numpy=True)
            self.index = faiss.IndexFlatL2(self.dims)
            self.index.add(embeddings)
            print(f"✅ Chat Engine Ready ({self.index.ntotal} items indexed).")
            
        except Exception as e:
            print(f"❌ Error loading Chat Engine: {e}")

    @lru_cache(maxsize=100)
    def embed_query(self, query: str):
        return self.model.encode([query])

    def extract_filters(self, query: str) -> dict:
        filters = {}
        query_lower = query.lower()
        
        # 1. Price
        price_match = re.search(r'(?:under|less than|max|below)\s*\$?(\d+)', query, re.I)
        if price_match:
            filters['max_price'] = float(price_match.group(1))
            
        # 2. Color
        common_colors = ['black', 'blue', 'white', 'red', 'pink', 'green', 'beige', 'grey', 'yellow', 'brown']
        for color in common_colors:
            if color in query_lower:
                filters['color'] = color
                break
        
        # 3. Gender / Section (The Critical Fix)
        if any(x in query_lower for x in ['men', 'man', 'male', 'boy', 'guy']):
            filters['gender'] = 'Menswear'
        elif any(x in query_lower for x in ['women', 'woman', 'female', 'girl', 'lady']):
            filters['gender'] = 'Ladieswear'
        elif 'baby' in query_lower:
            filters['gender'] = 'Baby'
                
        return filters

    def apply_filters(self, candidates: pd.DataFrame, filters: dict) -> pd.DataFrame:
        df = candidates.copy()
        
        # Price Filter
        if 'max_price' in filters and 'price' in df.columns:
             df = df[df['price'] <= filters['max_price']]
        
        # Color Filter
        if 'color' in filters:
            df = df[df['colour_group_name'].str.contains(filters['color'], case=False, na=False)]

        # Gender Filter (New)
        if 'gender' in filters:
            # We check index_group_name (e.g., "Ladieswear", "Menswear", "Divided", "Baby/Children")
            # If user wants Men, we look for 'Menswear' OR 'Divided' (Unisex) if strictly needed
            target = filters['gender']
            if target == 'Menswear':
                # Filter for Menswear explicitly
                df = df[df['index_group_name'].str.contains('Men', case=False, na=False)]
            elif target == 'Ladieswear':
                df = df[df['index_group_name'].str.contains('Ladies|Woman', case=False, na=False)]
            elif target == 'Baby':
                df = df[df['index_group_name'].str.contains('Baby', case=False, na=False)]
            
        return df

    def build_context(self, items: pd.DataFrame) -> str:
        """Formats the data for the LLM with new design elements"""
        context_parts = []
        for _, row in items.iterrows():
            # Use the new color names and structure
            item_str = f"""
- Item ID: {row['article_id']}
- Name: {row['prod_name']}
- Section: {row['index_group_name']} ({row['section_name']})
- Category: {row['product_group_name']}
- Color: {row['colour_group_name']}
- Description: {row['detail_desc']}
"""
            context_parts.append(item_str)
        return "\n".join(context_parts)

    def generate_response(self, messages: list):
        if self.index is None:
            self.load_resources()
            
        if self.index is None:
            return "System is starting up..."

        last_user_msg = messages[-1]['content']
        
        filters = self.extract_filters(last_user_msg)
        query_vec = self.embed_query(last_user_msg)
        
        D, I = self.index.search(query_vec, k=50) 
        
        candidate_indices = [i for i in I[0] if i != -1 and i < len(self.df)]
        candidates_df = self.df.iloc[candidate_indices]
        
        filtered_df = self.apply_filters(candidates_df, filters)
        
        if filtered_df.empty:
            final_df = candidates_df.head(3)
            system_note = "Note: I couldn't find exact matches for your specific filters, so I am showing the closest visual and semantic matches."
        else:
            final_df = filtered_df.head(5)
            system_note = ""

        context_text = self.build_context(final_df)
        
        # --- NEW PROMPT DESIGN FOR BETTER RESPONSES ---
        system_prompt = f"""
You are an expert H&M Fashion Stylist, focusing on high-quality recommendations.
Your persona is helpful, stylish, and uses elegant language.

User Query: "{last_user_msg}"
Detected Filters: {filters if filters else "None"}
{system_note}

INVENTORY MATCHES:
{context_text}

INSTRUCTIONS:
1.  Analyze the 'User Query' and 'Detected Filters'.
2.  Select the MOST relevant items from 'INVENTORY MATCHES'. Prioritize items that meet ALL criteria (color, price, gender).
3.  For each recommendation:
    - State the Item ID and Color clearly.
    - Briefly explain WHY it's a good fit (mentioning description, section, or price).
    - Keep the explanation concise and stylish (1-2 sentences max per item).
4.  If no items from the list precisely match the user's request (e.g., wrong gender, wrong price), politely apologize and offer the closest alternatives from the list. Do NOT invent items.
5.  End with a friendly closing, inviting further questions.
"""
        
        try:
            completion = self.groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": last_user_msg} 
                ],
                temperature=0.5,
                max_tokens=300,
                stop=None,
            )
            return completion.choices[0].message.content
            
        except Exception as e:
            print(f"Groq Error: {str(e)}")
            return f"I'm having trouble connecting to my brain (Groq API). Error: {str(e)}"

chat_engine = ChatService()