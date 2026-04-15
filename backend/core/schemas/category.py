from uuid import UUID
from pydantic import BaseModel, Field, field_validator
from typing import Literal, Optional

class CategoryBase(BaseModel):
    name: str = Field(..., max_length=100, description="Название категории")
    type: Literal['income', 'expense'] = Field(..., description="Тип категории: доход или расход")

    @field_validator('name')
    def name_not_empty(cls, v):
        if not v.strip():
            raise ValueError('Название категории не может быть пустым')
        return v

# Схема для запроса от клиента (без user_id)
class CategoryCreateRequest(BaseModel):
    name: str
    type: Literal['income', 'expense']

# Схема для внутреннего использования (с user_id и опциональными полями)
class CategoryCreate(CategoryBase):
    user_id: UUID
    cat_limit: Optional[float] = None
    id_icon: str = "default_icon"

class CategoryRead(CategoryBase):
    id: UUID
    user_id: UUID
    cat_limit: Optional[float] = None
    id_icon: str

    model_config = {"from_attributes": True}
