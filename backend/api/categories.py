from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from core import db_helper
from core.schemas.category import CategoryCreateRequest, CategoryRead, CategoryCreate
from crud.categories import create_category, get_categories_by_user
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
):
    try:
        return await get_categories_by_user(session, user_id=current_user.id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch categories"
        )
