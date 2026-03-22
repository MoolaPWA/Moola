from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Sequence
from core.models import User

async def get_all_users(session: AsyncSession) -> Sequence[User]:
    stmt = select(User)
    result = await session.scalars(stmt)
    return result.all()