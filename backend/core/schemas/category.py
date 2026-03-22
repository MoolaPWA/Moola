from uuid import UUID
from pydantic import BaseModel, Field, field_validator
from typing import Literal

class CategoryBase(BaseModel):
    name: str = Field(..., max_length=100, description="Название категории")
    type: Literal['income', 'expense'] = Field(..., description="Тип категории: доход или расход")

    @field_validator('name')
    def name_not_empty(cls, v):
        if not v.strip():
            raise ValueError('Название категории не может быть пустым')
        return v

class CategoryCreate(CategoryBase):
    user_id: UUID = Field(..., description="ID пользователя, которому принадлежит категория")

class CategoryRead(CategoryBase):
    id: UUID = Field(..., description="Уникальный идентификатор категории")
    user_id: UUID = Field(..., description="ID пользователя")

    model_config = {"from_attributes": True}