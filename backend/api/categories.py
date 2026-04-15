from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from core import db_helper
from core.schemas.category import CategoryCreateRequest, CategoryRead, CategoryCreate
from crud.categories import create_category, get_categories
from core.auth import get_current_user
from core.models import User

router = APIRouter(prefix="/categories", tags=["Categories"])

@router.post("", response_model=CategoryRead)
async def create_category_endpoint(
    category_data: CategoryCreateRequest,
    session: AsyncSession = Depends(db_helper.session_getter),
    current_user: User = Depends(get_current_user),
):
    # Формируем внутренний объект CategoryCreate, подставляя user_id из токена
    create_data = CategoryCreate(
        user_id=current_user.id,
        name=category_data.name,
        type=category_data.type,
        cat_limit=None,
        id_icon="default_icon"
    )
    return await create_category(session, create_data)

@router.get("", response_model=list[CategoryRead])
async def list_categories(
    session: AsyncSession = Depends(db_helper.session_getter),
    current_user: User = Depends(get_current_user),
):
    return await get_categories(session, user_id=current_user.id)
