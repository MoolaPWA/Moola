from uuid import UUID
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Literal

class TransactionBase(BaseModel):
    amount: Decimal = Field(..., gt=0, decimal_places=2, description="Сумма транзакции (положительное число)")
    type: Literal['income', 'expense'] = Field(..., description="Тип транзакции: доход или расход")
    transaction_date: datetime = Field(..., description="Дата и время совершения транзакции")
    description: Optional[str] = Field(None, max_length=255, description="Описание (необязательно)")

    @field_validator('transaction_date')
    def not_future_date(cls, v: datetime) -> datetime:
        if v > datetime.now().astimezone(v.tzinfo):
            raise ValueError('transaction_date cannot be in the future')
        return v

class TransactionCreate(TransactionBase):
    user_id: UUID = Field(..., description="ID пользователя")
    category_id: Optional[UUID] = Field(None, description="ID категории (если выбрана)")

class TransactionRead(TransactionBase):
    id: UUID
    user_id: UUID
    category_id: Optional[UUID]
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}

class TransactionUpdate(BaseModel):
    amount: Decimal = Field(..., gt=0, decimal_places=2)
    type: Literal['income', 'expense']
    transaction_date: datetime
    description: Optional[str] = Field(None, max_length=255)
    category_id: Optional[UUID] = None

class TransactionPatch(BaseModel):
    amount: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    type: Optional[Literal['income', 'expense']] = None
    transaction_date: Optional[datetime] = None
    description: Optional[str] = Field(None, max_length=255)
    category_id: Optional[UUID] = None

class TransactionPatchItem(BaseModel):
    id: UUID
    amount: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    type: Optional[Literal['income', 'expense']] = None
    transaction_date: Optional[datetime] = None
    description: Optional[str] = Field(None, max_length=255)
    category_id: Optional[UUID] = None

class BulkTransactionPatch(BaseModel):
    updates: List[TransactionPatchItem]