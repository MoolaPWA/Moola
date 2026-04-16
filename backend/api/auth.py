from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import update
from datetime import datetime
from uuid import UUID

from core import db_helper
from core.models import User, RefreshToken
from core.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    create_refresh_token_in_db,
    get_refresh_token,
    revoke_refresh_token,
    get_current_user,
    decode_token,
)
from crud.users import get_user_by_email, create_user
from core.schemas.auth import UserRegister, UserLogin, TokenResponse, RefreshRequest

router = APIRouter(prefix="/auth", tags=["Auth"])


async def _revoke_all_user_refresh_tokens(session: AsyncSession, user_id: UUID) -> None:
    """Отозвать все активные refresh-токены пользователя (опционально)"""
    await session.execute(
        update(RefreshToken)
        .where(RefreshToken.user_id == user_id, RefreshToken.revoked.is_(None))
        .values(revoked=datetime.utcnow())
    )
    await session.commit()


async def _create_token_pair(
    session: AsyncSession, user_id: UUID, revoke_previous: bool = True
) -> tuple[str, str]:
    """Создать новую пару токенов, опционально отозвать старые refresh-токены"""
    if revoke_previous:
        await _revoke_all_user_refresh_tokens(session, user_id)

    access_token = create_access_token(data={"sub": str(user_id)})
    refresh_token = create_refresh_token(data={"sub": str(user_id)})
    await create_refresh_token_in_db(session, user_id, refresh_token)
    return access_token, refresh_token


@router.post("/register", response_model=TokenResponse)
async def register(
    user_data: UserRegister,
    session: AsyncSession = Depends(db_helper.session_getter),
):
    existing = await get_user_by_email(session, user_data.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    hashed_password = get_password_hash(user_data.password)
    new_user = await create_user(
        session, user_data.name, user_data.email, hashed_password
    )

    access_token, refresh_token = await _create_token_pair(session, new_user.id)
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/login", response_model=TokenResponse)
async def login(
    login_data: UserLogin,
    session: AsyncSession = Depends(db_helper.session_getter),
):
    user = await get_user_by_email(session, login_data.email)
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    access_token, refresh_token = await _create_token_pair(session, user.id)
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(
    refresh_data: RefreshRequest,
    session: AsyncSession = Depends(db_helper.session_getter),
):
    refresh_token_obj = await get_refresh_token(session, refresh_data.refresh_token)
    if not refresh_token_obj:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    payload = decode_token(refresh_data.refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
        )

    user_id = UUID(payload.get("sub"))
    if refresh_token_obj.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token mismatch",
        )

    # Отзываем старый refresh-токен и создаём новую пару
    await revoke_refresh_token(session, refresh_data.refresh_token)
    access_token, refresh_token = await _create_token_pair(
        session, user_id, revoke_previous=False
    )

    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout(
    refresh_data: RefreshRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(db_helper.session_getter),
):
    # Отзываем только переданный refresh-токен (можно отозвать все, см. _revoke_all_user_refresh_tokens)
    await revoke_refresh_token(session, refresh_data.refresh_token)
    return {"detail": "Successfully logged out"}
