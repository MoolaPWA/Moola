from uuid import UUID
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field, field_validator
from typing import Optional, Literal

class TransactionBase(BaseModel):
    amount: Decimal = Field(..., gt=0, decimal_places=2, description="Сумма транзакции (положительное число)")
    type: Literal['income', 'expense'] = Field(..., description="Тип транзакции: доход или расход")
    transaction_date: datetime = Field(..., description="Дата и время совершения транзакции")
    description: Optional[str] = Field(None, max_length=255, description="Описание (необязательно)")

class TransactionCreate(TransactionBase):
    user_id: UUID = Field(..., description="ID пользователя")
    category_id: Optional[UUID] = Field(None, description="ID категории (если выбрана)")

class TransactionRead(TransactionBase):
    id: UUID = Field(..., description="Уникальный идентификатор транзакции")
    user_id: UUID = Field(..., description="ID пользователя")
    category_id: Optional[UUID] = Field(None, description="ID категории")
    created_at: datetime = Field(..., description="Дата создания записи")
    updated_at: datetime = Field(..., description="Дата последнего обновления")

    model_config = {"from_attributes": True}