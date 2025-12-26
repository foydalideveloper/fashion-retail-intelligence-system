#fashion-retail-backend/app/routers/health.py
from fastapi import APIRouter

router = APIRouter(prefix="/health", tags=["System"])

@router.get("/")
async def health_check():
    return {"status": "healthy", "service": "Fashion Retail Intelligence"}