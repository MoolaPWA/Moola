import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from typing import Sequence, Optional, List
from uuid import UUID
from core.models import Category
from core.schemas.category import CategoryCreate
from sqlalchemy.exc import IntegrityError

logger = logging.getLogger(__name__)

async def sync_categories_bulk(
    session: AsyncSession,
    user_id: UUID,
    items: List[dict]
) -> List[Category]:
    """
    Синхронизация категорий. Каждый элемент содержит id, updated_at и поля.
    Возвращает список обновлённых/созданных объектов Category.
    """
    synced: List[Category] = []

    for item in items:
        try:
            existing = await session.get(Category, item.id)

            if existing:
                if existing.user_id != user_id:
                    logger.warning(f"Sync: category {item.id} belongs to another user, skipping")
                    continue
                
                if item.updated_at <= existing.updated_at:
                    logger.debug(f"Sync: category {item.id} skipped (server version is newer or equal)")
                    continue

                existing.name = item.name
                existing.type = item.type
                existing.icon_path = item.icon_path
                existing.background_color = item.background_color
                existing.icon_color = item.icon_color
                existing.is_deleted = item.is_deleted
                existing.updated_at = item.updated_at
                synced.append(existing)

            else:
                conflict = await session.scalar(
                    select(Category).where(
                        Category.user_id == user_id,
                        Category.name == item.name,
                        Category.type == item.type,
                        Category.is_deleted == False
                    )
                )
                if conflict:
                    logger.warning(
                        f"Sync: category '{item.name}' ({item.type}) already exists with id {conflict.id}, "
                        f"cannot create duplicate with id {item.id}. Skipping."
                    )
                    continue

                new_cat = Category(
                    id=item.id,
                    user_id=user_id,
                    name=item.name,
                    type=item.type,
                    cat_limit=None,
                    icon_path=item.icon_path,
                    background_color=item.background_color,
                    icon_color=item.icon_color,
                    is_deleted=item.is_deleted,
                    created_at=item.updated_at,
                    updated_at=item.updated_at,
                )
                session.add(new_cat)
                synced.append(new_cat)

        except IntegrityError:
            await session.rollback()
            logger.warning(f"Sync: duplicate id {item.id}, skipped due to IntegrityError")
            continue
        except Exception as e:
            logger.error(f"Sync: unexpected error processing category {item.id}: {e}", exc_info=True)
            continue

    try:
        await session.commit()
        for obj in synced:
            await session.refresh(obj)
    except Exception as e:
        await session.rollback()
        logger.error(f"Sync categories commit failed: {e}", exc_info=True)
        raise

    return synced

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

    existing = await session.scalar(select(Category).where(
        Category.user_id == user_id,
        Category.name == name,
        Category.type == cat_type,
        Category.is_deleted == False
    ))
    if existing:
        raise ValueError(f"Category '{name}' of type '{cat_type}' already exists for this user")

    if category_data.id:
        existing_id = await session.get(Category, category_data.id)
        if existing_id:
            raise ValueError(f"Category with id '{category_data.id}' already exists")

    new_category = Category(
        id=category_data.id,
        user_id=user_id,
        name=name,
        type=cat_type,
        cat_limit=category_data.cat_limit,
        icon_path=category_data.icon_path,
        background_color=category_data.background_color,
        icon_color=category_data.icon_color
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
    
    stmt = update(Category).where(Category.id == category_id).values(is_deleted=True)
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
