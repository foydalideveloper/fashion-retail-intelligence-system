from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict
from app.services.chat_service import chat_engine

router = APIRouter(prefix="/api/chat", tags=["Chat"])

class ChatRequest(BaseModel):
    messages: List[Dict[str, str]]

@router.post("/")
async def chat_endpoint(request: ChatRequest):
    """
    Hybrid RAG Chatbot Endpoint.
    """
    response = chat_engine.generate_response(request.messages)
    return {"reply": response}