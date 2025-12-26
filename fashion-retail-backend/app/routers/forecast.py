#fashion-retail-backend/app/routers/forecast.py
from fastapi import APIRouter, HTTPException
from app.services.forecasting_service import forecaster

router = APIRouter(prefix="/api/forecast", tags=["Forecasting"])

@router.get("/{item_id}")
async def get_forecast(item_id: str):
    """
    Get 28-day sales forecast for a specific item.
    """
    result = forecaster.predict(item_id)
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
        
    return result