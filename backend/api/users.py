from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from crud.users import get_all_users
from crud.users import update_user
from sqlalchemy.ext.asyncio import AsyncSession
from core import db_helper
from core.schemas.user import UserPatch, UserRead, UserUpdate
from core.auth import get_current_user, get_password_hash
from core.models import User

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("", response_model=list[UserRead])
async def get_users(
    session: AsyncSession = Depends(db_helper.session_getter),
    current_user: User = Depends(get_current_user),
):
    try:
        users = await get_all_users(session=session)
        return users
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve users"
        )


@router.put("/{user_id}", response_model=UserRead)
async def update_user(
    user_id: UUID,
    user_data: UserUpdate,
    session: AsyncSession = Depends(db_helper.session_getter),
    current_user: User = Depends(get_current_user),
):
    # только сам пользователь может обновить свой профиль (или админ)
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    hashed_password = get_password_hash(user_data.password)
    updated = await update_user(
        session, user_id, user_data.name, user_data.email, hashed_password
    )
    if not updated:
        raise HTTPException(status_code=404, detail="User not found")
    return updated

@router.patch("/{user_id}", response_model=UserRead)
async def patch_user(
    user_id: UUID,
    patch_data: UserPatch,
    session: AsyncSession = Depends(db_helper.session_getter),
    current_user: User = Depends(get_current_user),
):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    # Преобразуем Pydantic-модель в dict, исключая None
    data = patch_data.dict(exclude_unset=True)
    if not data:
        raise HTTPException(status_code=400, detail="No fields to update")
    if 'password' in data:
        data['hashed_password'] = get_password_hash(data.pop('password'))
    try:
        updated = await patch_user(session, user_id, data)
        if not updated:
            raise HTTPException(status_code=404, detail="User not found")
        return updated
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))