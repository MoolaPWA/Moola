from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Sequence
from core.models import User

async def get_all_users(session: AsyncSession) -> Sequence[User]:
    stmt = select(User)
    result = await session.scalars(stmt)
    return result.all()

async def create_user(session: AsyncSession, name: str, email: str, hashed_password: str) -> User:
    new_user = User(name=name, email=email, hashed_password=hashed_password)
    session.add(new_user)
    await session.commit()
    await session.refresh(new_user)
    return new_user

async def get_user_by_email(session: AsyncSession, email: str) -> User | None:
    result = await session.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()
