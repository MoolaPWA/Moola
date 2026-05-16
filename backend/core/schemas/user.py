from pydantic import BaseModel, EmailStr, Field, field_validator
from uuid import UUID
from typing import Optional

class UserBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr  # автоматическая проверка формата email

    @field_validator('name')
    def name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError('Name cannot be empty')
        return v

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=72)  # типичная длина bcrypt

    @field_validator('password')
    def password_strength(cls, v: str) -> str:
        # базовая проверка: хотя бы одна цифра и одна буква
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        if not any(c.isalpha() for c in v):
            raise ValueError('Password must contain at least one letter')
        return v

class UserRead(UserBase):
    id: UUID
    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8)

class UserPatch(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=8)   # новый пароль (будет хеширован)
