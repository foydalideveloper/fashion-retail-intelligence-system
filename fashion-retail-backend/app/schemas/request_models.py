#fashion-retail-backend/app/schemas/request_models.py
from pydantic import BaseModel
from typing import List

class Transaction(BaseModel):
    sales: float
    lag_7: float

class TransactionBatch(BaseModel):
    transactions: List[Transaction]