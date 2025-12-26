#fashion-retail-backend/app/main.py
import os
# ⚠️ FIX MAC CRASHES:
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"
os.environ["TOKENIZERS_PARALLELISM"] = "false"
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.lifespan import lifespan
from app.routers import health, forecast, recommend, monitor # 
from app.routers import health, forecast, recommend, monitor, chat

app = FastAPI(title="FRIS API", lifespan=lifespan)

# Allow React Frontend (running on port 5173 usually) to talk to Backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, change to ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register All Routers
app.include_router(health.router)
app.include_router(forecast.router)
app.include_router(recommend.router)
app.include_router(monitor.router) 
app.include_router(chat.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)