from uuid import UUID
from pydantic import BaseModel, Field, field_validator
from typing import Literal, Optional

class CategoryBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Название категории")
    type: Literal['income', 'expense'] = Field(..., description="Тип категории")

    @field_validator('name')
    def name_not_empty(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError('Название категории не может быть пустым')
        return stripped

class CategoryCreateRequest(CategoryBase):
    """Схема для запроса от клиента (без user_id)"""
    pass

class CategoryCreate(CategoryBase):
    user_id: UUID
    cat_limit: Optional[float] = Field(None, ge=0, description="Лимит категории (если задан)")
    id_icon: str = Field("default_icon", max_length=50)

class CategoryRead(CategoryBase):
    id: UUID
    user_id: UUID
    cat_limit: Optional[float]
    id_icon: str
    model_config = {"from_attributes": True}

class CategoryUpdate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    type: Literal['income', 'expense']

class CategoryPatch(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    type: Optional[Literal['income', 'expense']] = None