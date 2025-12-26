from contextlib import asynccontextmanager
from fastapi import FastAPI
import pandas as pd
from app.config import settings

# Import ALL Services
from app.services.forecasting_service import forecaster
from app.services.recommendation_service import recommender
from app.services.anomaly_service import watchdog
from app.services.chat_service import chat_engine

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("\n🚀 STARTUP: Initializing Fashion Retail Intelligence System...")

    # 1. Load Data (Keep this, it is safe and fast)
    try:
        print(f"📦 Loading Historical Data...")
        df = pd.read_parquet(settings.DATA_PATH)
        forecaster.load_data(df)
        print("   ✅ History Data Loaded.")
    except Exception as e:
        print(f"   ❌ Data Load Failed: {e}")

    # 2. LAZY LOAD STRATEGY: 
    # We commented these out to prevent startup crashes. 
    # They will now load automatically the first time they are used.
    
    # forecaster.load_model()   <-- This was causing the SegFault
    # recommender.load_model()
    # watchdog.load_model()
    # chat_engine.load_resources()

    print("✅ SYSTEM READY: Engines will load on demand.\n")
    yield
    print("🛑 SHUTDOWN: Cleaning up resources...")