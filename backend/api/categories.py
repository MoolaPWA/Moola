from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from core import db_helper
from core.schemas.category import CategoryCreate, CategoryRead
from crud.categories import create_category, get_categories

router = APIRouter(prefix="/categories", tags=["Categories"])

@router.post("", response_model=CategoryRead)
async def create_category_endpoint(
    category_data: CategoryCreate,
    session: AsyncSession = Depends(db_helper.session_getter),
):
    # Здесь можно добавить проверку, что user_id принадлежит текущему пользователю
    return await create_category(session, category_data)

@router.get("", response_model=list[CategoryRead])
async def list_categories(
    session: AsyncSession = Depends(db_helper.session_getter),
):
    return await get_categories(session)