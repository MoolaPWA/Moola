from uuid import UUID
from pydantic import BaseModel, Field, field_validator
from typing import Optional, Literal
import re

ALLOWED_ICONS = {"icons/default.svg", "icons/food.svg", "icons/taxi.svg", "icons/shopping.svg"}  # пример

class CategoryBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    type: Literal['income', 'expense']
    icon_path: str = Field(
        "default_icon",
        description="Относительный путь к иконке в хранилище (без ../). Например: icons/food.svg"
    )
    background_color: str = Field(
        "#FFFFFF",
        pattern=r"^#[0-9a-fA-F]{6}$",
        description="Цвет фона в формате HEX (#RRGGBB)"
    )
    icon_color: str = Field(
        "#000000",
        pattern=r"^#[0-9a-fA-F]{6}$",
        description="Цвет иконки в формате HEX (#RRGGBB)"
    )

    @field_validator('name')
    def name_not_empty(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError('Название категории не может быть пустым')
        return stripped

    @field_validator('icon_path')
    def validate_icon_path(cls, v: str) -> str:
        if '..' in v or v.startswith('/'):
            raise ValueError('icon_path не должен содержать .. или начинаться с /')
        if not re.match(r'^[a-zA-Z0-9_/]+\.svg$', v):
            raise ValueError('icon_path должен соответствовать шаблону')
        if v not in ALLOWED_ICONS:
            raise ValueError(f'Недопустимое значение icon_path: {v}')
        return v

class CategoryCreateRequest(CategoryBase):
    pass

class CategoryCreate(CategoryBase):
    user_id: UUID
    cat_limit: Optional[float] = Field(None, ge=0)

class CategoryRead(CategoryBase):
    id: UUID
    user_id: UUID
    cat_limit: Optional[float]
    model_config = {"from_attributes": True}

class CategoryUpdate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    type: Literal['income', 'expense']
    icon_path: str = Field(..., description="Относительный путь к иконке")
    background_color: str = Field(..., pattern=r"^#[0-9a-fA-F]{6}$")
    icon_color: str = Field(..., pattern=r"^#[0-9a-fA-F]{6}$")

class CategoryPatch(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    type: Optional[Literal['income', 'expense']] = None
    icon_path: Optional[str] = Field(None, description="Относительный путь к иконке")
    background_color: Optional[str] = Field(None, pattern=r"^#[0-9a-fA-F]{6}$")
    icon_color: Optional[str] = Field(None, pattern=r"^#[0-9a-fA-F]{6}$")
