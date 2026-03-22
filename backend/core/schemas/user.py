from pydantic import BaseModel
from uuid import UUID

class UserBase(BaseModel):
    id: UUID
    name: str
    email: str
    password: str

class UserCreate(UserBase):
    pass

class UserRead(UserBase):
    id: UUID