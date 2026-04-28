from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from typing import Sequence, Optional
from uuid import UUID
from core.models import Category
from core.schemas.category import CategoryCreate

async def get_category_by_id(session: AsyncSession, category_id: UUID) -> Optional[Category]:
    stmt = select(Category).where(Category.id == category_id)
    result = await session.scalar(stmt)
    return result

async def get_categories_by_user(session: AsyncSession, user_id: UUID) -> Sequence[Category]:
    stmt = select(Category).where(Category.user_id == user_id).order_by(Category.name)
    result = await session.scalars(stmt)
    return result.all()

async def create_category(session: AsyncSession, category_data: CategoryCreate) -> Category:
    user_id = category_data.user_id
    name = category_data.name
    cat_type = category_data.type

    # Валидация: уникальность комбинации (user_id, name, type)
    existing = await session.scalar(select(Category).where(
        Category.user_id == user_id,
        Category.name == name,
        Category.type == cat_type
    ))
    if existing:
        raise ValueError(f"Category '{name}' of type '{cat_type}' already exists for this user")

    new_category = Category(
        user_id=user_id,
        name=name,
        type=cat_type,
        cat_limit=category_data.cat_limit,
        id_icon=category_data.id_icon
    )
    session.add(new_category)
    await session.commit()
    await session.refresh(new_category)
    return new_category

async def update_category(
    session: AsyncSession,
    category_id: UUID,
    **kwargs
) -> Optional[Category]:
    category = await get_category_by_id(session, category_id)
    if not category:
        raise ValueError("Category not found")

    # Если обновляются name или type, проверить уникальность
    new_name = kwargs.get('name', category.name)
    new_type = kwargs.get('type', category.type)
    if (new_name != category.name) or (new_type != category.type):
        existing = await session.scalar(select(Category).where(
            Category.user_id == category.user_id,
            Category.name == new_name,
            Category.type == new_type,
            Category.id != category_id
        ))
        if existing:
            raise ValueError(f"Category '{new_name}' of type '{new_type}' already exists for this user")

    stmt = update(Category).where(Category.id == category_id).values(**kwargs).returning(Category)
    result = await session.execute(stmt)
    await session.commit()
    return result.scalar_one_or_none()

async def delete_category(session: AsyncSession, category_id: UUID) -> bool:
    category = await get_category_by_id(session, category_id)
    if not category:
        return False

    stmt = delete(Category).where(Category.id == category_id)
    result = await session.execute(stmt)
    await session.commit()
    return result.rowcount > 0
