from fastapi import APIRouter, Depends, HTTPException, status
from crud.users import get_all_users
from sqlalchemy.ext.asyncio import AsyncSession
from core import db_helper
from core.schemas.user import UserRead
from core.auth import get_current_user
from core.models import User

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("", response_model=list[UserRead])
async def get_users(
    session: AsyncSession = Depends(db_helper.session_getter),
    current_user: User = Depends(get_current_user),
):
    # Опционально: проверка прав администратора
    # if not current_user.is_admin:
    #     raise HTTPException(status_code=403, detail="Not enough permissions")
    users = await get_all_users(session=session)
    return users
