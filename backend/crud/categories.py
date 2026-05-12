from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from typing import Sequence, Optional
from uuid import UUID
from core.models import Category
from core.schemas.category import CategoryCreate

async def get_category_by_id(session: AsyncSession, category_id: UUID, include_deleted: bool = False) -> Optional[Category]:
    stmt = select(Category).where(Category.id == category_id)
    if not include_deleted:
        stmt = stmt.where(Category.is_deleted == False)
    result = await session.scalar(stmt)
    return result

async def get_categories_by_user(
    session: AsyncSession,
    user_id: UUID,
    type_filter: Optional[str] = None,
    include_deleted: bool = False,
) -> Sequence[Category]:
    stmt = select(Category).where(Category.user_id == user_id)
    if not include_deleted:
        stmt = stmt.where(Category.is_deleted == False)
    if type_filter:
        stmt = stmt.where(Category.type == type_filter)
    stmt = stmt.order_by(Category.name)
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
        Category.type == cat_type,
        Category.is_deleted == False
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
    user_id: UUID,
    name: str,
    type: str,
) -> Optional[Category]:
    category = await get_category_by_id(session, category_id)
    if not category or category.user_id != user_id:
        raise ValueError("Category not found or not owned by user")
    existing = await session.scalar(
        select(Category).where(
            Category.user_id == user_id,
            Category.name == name,
            Category.type == type,
            Category.id != category_id,
            Category.is_deleted == False
        )
    )
    if existing:
        raise ValueError("Category with this name and type already exists")
    category.name = name
    category.type = type
    await session.commit()
    await session.refresh(category)
    return category

async def soft_delete_category(session: AsyncSession, category_id: UUID) -> bool:
    """Perform soft delete on category - sets is_deleted=True and updates updated_at"""
    category = await get_category_by_id(session, category_id, include_deleted=False)
    if not category:
        return False
    if category.is_deleted:
        raise ValueError("Category is already deleted")
    
    stmt = update(Category).where(Category.id == category_id).values(is_deleted=True).returning(Category)
    result = await session.execute(stmt)
    await session.commit()
    return result.rowcount > 0

async def delete_category(session: AsyncSession, category_id: UUID) -> bool:
    category = await get_category_by_id(session, category_id)
    if not category:
        return False

    stmt = delete(Category).where(Category.id == category_id)
    result = await session.execute(stmt)
    await session.commit()
    return result.rowcount > 0

async def patch_category(
    session: AsyncSession,
    category_id: UUID,
    user_id: UUID,
    patch_data: dict,
) -> Optional[Category]:
    category = await get_category_by_id(session, category_id)
    if not category or category.user_id != user_id:
        raise ValueError("Category not found or not owned by user")
    # Если обновляются name и/или type, проверить уникальность
    new_name = patch_data.get('name', category.name)
    new_type = patch_data.get('type', category.type)
    if (new_name != category.name) or (new_type != category.type):
        existing = await session.scalar(
            select(Category).where(
                Category.user_id == user_id,
                Category.name == new_name,
                Category.type == new_type,
                Category.id != category_id,
                Category.is_deleted == False
            )
        )
        if existing:
            raise ValueError("Category with this name and type already exists")
    # Применяем только переданные поля
    for key, value in patch_data.items():
        setattr(category, key, value)
    await session.commit()
    await session.refresh(category)
    return category
