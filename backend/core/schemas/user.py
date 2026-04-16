from pydantic import BaseModel
from uuid import UUID

class UserBase(BaseModel):
    name: str
    email: str

class UserCreate(UserBase):
    name: str
    password: str
    email: str

class UserRead(UserBase):
    id: UUID

    model_config = {"from_attributes": True}

