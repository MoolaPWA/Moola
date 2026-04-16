from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import UUID, select
from typing import Sequence
from core.models import Category
from core.schemas.category import CategoryCreate

async def create_category(session: AsyncSession, category_data: CategoryCreate) -> Category:
    new_category = Category(
        user_id=category_data.user_id,
        name=category_data.name,
        type=category_data.type,
        cat_limit=category_data.cat_limit,
        id_icon=category_data.id_icon
    )
    session.add(new_category)
    await session.commit()
    await session.refresh(new_category)
    return new_category

async def get_categories(session: AsyncSession, user_id: UUID) -> Sequence[Category]:
    stmt = select(Category).where(Category.user_id == user_id)
    result = await session.scalars(stmt)
    return result.all()
