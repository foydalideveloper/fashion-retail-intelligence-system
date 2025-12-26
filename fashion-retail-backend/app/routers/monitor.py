#fashion-retail-backend/app/routers/monitor.py
from fastapi import APIRouter, Body, HTTPException
from app.services.anomaly_service import watchdog

# --- 🚨 THIS VARIABLE IS REQUIRED ---
router = APIRouter(prefix="/api/monitor", tags=["Anomaly Detection"])

@router.post("/check")
async def check_anomalies(transactions: list = Body(...)):
    """
    Accepts a list of transactions and flags fraud/errors.
    Sample Input: [{"sales": 50, "lag_7": 48}, {"sales": 5000, "lag_7": 10}]
    """
    if not transactions:
        raise HTTPException(status_code=400, detail="No transactions provided")
        
    results = watchdog.detect(transactions)
    return results