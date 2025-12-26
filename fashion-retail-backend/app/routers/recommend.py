#fashion-retail-backend/app/routers/recommend.py
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.recommendation_service import recommender

# --- 🚨 THIS VARIABLE IS WHAT MAIN.PY IS LOOKING FOR ---
router = APIRouter(prefix="/api/recommend", tags=["Visual Search"])

@router.post("/visual-search")
async def visual_search(file: UploadFile = File(...)):
    """
    Upload an image -> Get similar products.
    """
    try:
        # Read the file bytes
        image_bytes = await file.read()
        
        # Pass to the service
        result = recommender.search(image_bytes)
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
            
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))