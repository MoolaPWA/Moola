from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from typing import Sequence, Optional
from uuid import UUID
from core.models import User

async def get_all_users(session: AsyncSession, include_deleted: bool = False) -> Sequence[User]:
    stmt = select(User)
    if not include_deleted:
        stmt = stmt.where(User.is_deleted == False)
    result = await session.scalars(stmt)
    return result.all()

async def get_user_by_id(session: AsyncSession, user_id: UUID, include_deleted: bool = False) -> Optional[User]:
    stmt = select(User).where(User.id == user_id)
    if not include_deleted:
        stmt = stmt.where(User.is_deleted == False)
    result = await session.scalar(stmt)
    return result

async def get_user_by_email(session: AsyncSession, email: str, include_deleted: bool = False) -> Optional[User]:
    stmt = select(User).where(User.email == email)
    if not include_deleted:
        stmt = stmt.where(User.is_deleted == False)
    result = await session.scalar(stmt)
    return result

async def create_user(session: AsyncSession, name: str, email: str, hashed_password: str) -> User:
    # Валидация: проверяем, нет ли пользователя с таким email
    existing = await get_user_by_email(session, email, include_deleted=False)
    if existing:
        raise ValueError(f"User with email '{email}' already exists")

    new_user = User(name=name, email=email, hashed_password=hashed_password)
    session.add(new_user)
    await session.commit()
    await session.refresh(new_user)
    return new_user

async def update_user(
    session: AsyncSession,
    user_id: UUID,
    name: str,
    email: str,
    hashed_password: str,
) -> Optional[User]:
    existing = await get_user_by_email(session, email)
    if existing and existing.id != user_id:
        raise ValueError("Email already exists")
    stmt = update(User).where(User.id == user_id).values(
        name=name, email=email, hashed_password=hashed_password
    ).returning(User)
    result = await session.execute(stmt)
    await session.commit()
    return result.scalar_one_or_none()

async def soft_delete_user(session: AsyncSession, user_id: UUID) -> bool:
    """Perform soft delete on user - sets is_deleted=True and updates updated_at"""
    user = await get_user_by_id(session, user_id, include_deleted=False)
    if not user:
        return False
    if user.is_deleted:
        raise ValueError("User is already deleted")
    
    stmt = update(User).where(User.id == user_id).values(is_deleted=True).returning(User)
    result = await session.execute(stmt)
    await session.commit()
    return result.rowcount > 0

async def delete_user(session: AsyncSession, user_id: UUID) -> bool:
    stmt = delete(User).where(User.id == user_id)
    result = await session.execute(stmt)
    await session.commit()
    return result.rowcount > 0

async def patch_user(
    session: AsyncSession,
    user_id: UUID,
    patch_data: dict,
) -> Optional[User]:
    # Если передан email, проверить уникальность
    if 'email' in patch_data:
        existing = await get_user_by_email(session, patch_data['email'])
        if existing and existing.id != user_id:
            raise ValueError("Email already exists")
    # Если передан пароль – хешировать (хеширование делаем в API слое, или здесь)
    # В API будет вызван get_password_hash до вызова этой функции
    stmt = update(User).where(User.id == user_id).values(**patch_data).returning(User)
    result = await session.execute(stmt)
    await session.commit()
    return result.scalar_one_or_none()
