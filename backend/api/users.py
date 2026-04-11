from fastapi import (
    APIRouter,
    Depends,
)
from crud.users import create_user, get_all_users
from sqlalchemy.ext.asyncio import AsyncSession
from core import db_helper
from core.schemas.user import UserCreate, UserRead

router = APIRouter(
    prefix="/users",
    tags=["Users"],
)

@router.get("", response_model=list[UserRead])
async def get_users(
    session: AsyncSession = Depends(db_helper.session_getter)
):
    users = await get_all_users(session=session)
    return users

@router.post("", response_model=UserRead)
async def create_user_endpoint(
    user_data: UserCreate,
    session: AsyncSession = Depends(db_helper.session_getter)
):
    return await create_user(session, user_data.name, user_data.email, user_data.password)

