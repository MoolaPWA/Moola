from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from core import db_helper
from core.schemas.transaction import TransactionCreate, TransactionRead
from crud.transactions import create_transaction, get_transactions_by_user
from core.auth import get_current_user
from core.models import User

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.post("", response_model=TransactionRead, status_code=status.HTTP_201_CREATED)
async def create_transaction_endpoint(
    transaction_data: TransactionCreate,
    session: AsyncSession = Depends(db_helper.session_getter),
    current_user: User = Depends(get_current_user),
):
    try:
        # Принудительно подставляем ID пользователя (безопасность)
        transaction_data.user_id = current_user.id
        return await create_transaction(session, transaction_data)

    except ValueError as e:
        # Ошибки из CRUD: категория не найдена, не принадлежит пользователю,
        # несовпадение типов, превышение лимита и т.п.
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while creating transaction"
        )


@router.get("", response_model=list[TransactionRead])
async def list_transactions(
    session: AsyncSession = Depends(db_helper.session_getter),
    current_user: User = Depends(get_current_user),
    limit: int = 100,
    offset: int = 0,
    type_filter: str = None,
):
    try:
        return await get_transactions_by_user(
            session,
            user_id=current_user.id,
            limit=limit,
            offset=offset,
            type_filter=type_filter,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch transactions"
        )
