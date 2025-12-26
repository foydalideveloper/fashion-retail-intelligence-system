#fashion-retail-backend/app/config.py
import os

class Settings:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    MODEL_DIR = os.path.join(os.path.dirname(BASE_DIR), "models")
    
    # File Paths
    TFT_MODEL_PATH = os.path.join(MODEL_DIR, "tft_saved_model.ckpt")
    DATA_PATH = os.path.join(MODEL_DIR, "transactions_top1000.parquet")
    FAISS_PATH = os.path.join(MODEL_DIR, "fashion_image_index.faiss")
    IDS_PATH = os.path.join(MODEL_DIR, "article_ids.pkl")
    ANOMALY_PATH = os.path.join(MODEL_DIR, "anomaly.pth")
    ARTICLES_PATH = os.path.join(MODEL_DIR, "articles.csv")

settings = Settings()