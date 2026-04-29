from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from core import db_helper
from core.schemas.category import CategoryCreateRequest, CategoryPatch, CategoryRead, CategoryCreate, CategoryUpdate
from crud.categories import create_category, get_categories_by_user, update_category
from core.auth import get_current_user
from core.models import User

router = APIRouter(prefix="/categories", tags=["Categories"])

@router.post("", response_model=CategoryRead, status_code=status.HTTP_201_CREATED)
async def create_category_endpoint(
    category_data: CategoryCreateRequest,
    session: AsyncSession = Depends(db_helper.session_getter),
    current_user: User = Depends(get_current_user),
):
    try:
        create_data = CategoryCreate(
            user_id=current_user.id,
            name=category_data.name,
            type=category_data.type,
            cat_limit=None,
            id_icon="default_icon"
        )
        return await create_category(session, create_data)

    except ValueError as e:
        # Перехватываем бизнес-ошибки из CRUD (уникальность/валидация)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except IntegrityError as e:
        # Ошибка уникальности на уровне БД (на всякий случай)
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Category with this name and type already exists"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while creating category"
        )

@router.get("", response_model=list[CategoryRead])
async def list_categories(
    session: AsyncSession = Depends(db_helper.session_getter),
    current_user: User = Depends(get_current_user),
    type_filter: Optional[str] = Query(None, regex="^(income|expense)$"),
):
    return await get_categories_by_user(session, current_user.id, type_filter=type_filter)

@router.put("/{category_id}", response_model=CategoryRead)
async def update_category_endpoint(
    category_id: UUID,
    category_data: CategoryUpdate,
    session: AsyncSession = Depends(db_helper.session_getter),
    current_user: User = Depends(get_current_user),
):
    try:
        updated = await update_category(
            session, category_id, current_user.id,
            category_data.name, category_data.type
        )
        if not updated:
            raise HTTPException(status_code=404, detail="Category not found")
        return updated
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/{category_id}", response_model=CategoryRead)
async def patch_category(
    category_id: UUID,
    patch_data: CategoryPatch,
    session: AsyncSession = Depends(db_helper.session_getter),
    current_user: User = Depends(get_current_user),
):
    data = patch_data.dict(exclude_unset=True)
    if not data:
        raise HTTPException(status_code=400, detail="No fields to update")
    try:
        updated = await patch_category(
            session, category_id, current_user.id, data
        )
        if not updated:
            raise HTTPException(status_code=404, detail="Category not found")
        return updated
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))