from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Sequence
from core.models import User

async def get_all_users(session: AsyncSession) -> Sequence[User]:
    stmt = select(User)
    result = await session.scalars(stmt)
    return result.all()

async def create_user(session: AsyncSession, name: str, email: str, password: str) -> User:
    new_user = User(name=name, email=email, password=password)
    session.add(new_user)
    await session.commit()
    await session.refresh(new_user)
    return new_user
