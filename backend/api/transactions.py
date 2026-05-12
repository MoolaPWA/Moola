from datetime import datetime
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from core import db_helper
from core.schemas.transaction import BulkTransactionPatch, TransactionCreate, TransactionPatch, TransactionRead, TransactionUpdate, TransactionSyncRequest
from crud.transactions import create_transaction, get_transactions_by_user, update_transaction, get_transaction_by_id, soft_delete_transaction, patch_transaction as crud_patch_transaction, patch_transactions_bulk as sync_transactions_bulk, sync_transactions_bulk
from core.auth import get_current_user
from core.models import User
from core.limiter import limiter
from fastapi import Request

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.post("/sync", response_model=list[TransactionRead])
@limiter.limit("10/minute")
async def sync_transactions(
    request: Request,
    sync_data: TransactionSyncRequest,
    session: AsyncSession = Depends(db_helper.session_getter),
    current_user: User = Depends(get_current_user),
):
    return await sync_transactions_bulk(session, current_user.id, sync_data.items)

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
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    type_filter: Optional[str] = Query(None, pattern="^(income|expense)$"),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    category_id: Optional[UUID] = Query(None),
):
    """Получить список транзакций с пагинацией и фильтрацией"""
    return await get_transactions_by_user(
        session, current_user.id,
        limit=limit, offset=offset,
        type_filter=type_filter,
        start_date=start_date, end_date=end_date,
        category_id=category_id
    )

@router.patch("/bulk", response_model=list[TransactionRead])
async def patch_transactions_bulk_endpoint(
    bulk_data: BulkTransactionPatch,
    session: AsyncSession = Depends(db_helper.session_getter),
    current_user: User = Depends(get_current_user),
):
    """
    Пример тела запроса:
    {
        "updates": [
            {"id": "uuid1", "amount": 1500.00, "description": "new desc"},
            {"id": "uuid2", "category_id": "uuid_cat", "type": "expense"}
        ]
    }
    """
    updates = bulk_data.updates
    if not updates:
        raise HTTPException(status_code=400, detail="No updates provided")
    try:
        updated = await sync_transactions_bulk(
            session, current_user.id, updates
        )
        return updated
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{transaction_id}", response_model=TransactionRead)
async def update_transaction_endpoint(
    transaction_id: UUID,
    tx_data: TransactionUpdate,
    session: AsyncSession = Depends(db_helper.session_getter),
    current_user: User = Depends(get_current_user),
):
    # Проверяем, что транзакция существует и принадлежит пользователю
    existing = await get_transaction_by_id(session, transaction_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Transaction not found")
    if existing.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your transaction")
    
    # Подготавливаем словарь для обновления
    update_data = tx_data.dict(exclude_unset=True)
    # При обновлении category_id нужно проверить категорию (это сделано в update_transaction)
    try:
        updated = await update_transaction(
            session, transaction_id, **update_data
        )
        return updated
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/{transaction_id}", response_model=TransactionRead)
async def patch_transaction_endpoint(
    transaction_id: UUID,
    patch_data: TransactionPatch,
    session: AsyncSession = Depends(db_helper.session_getter),
    current_user: User = Depends(get_current_user),
):
    data = patch_data.dict(exclude_unset=True)
    if not data:
        raise HTTPException(status_code=400, detail="No fields to update")
    try:
        updated = await crud_patch_transaction(
            session, transaction_id, current_user.id, data
        )
        if not updated:
            raise HTTPException(status_code=404, detail="Transaction not found")
        return updated
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{transaction_id}", status_code=status.HTTP_200_OK)
async def delete_transaction_endpoint(
    transaction_id: UUID,
    session: AsyncSession = Depends(db_helper.session_getter),
    current_user: User = Depends(get_current_user),
):
    # Проверяем, что транзакция существует и принадлежит пользователю
    transaction = await get_transaction_by_id(session, transaction_id, include_deleted=False)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    if transaction.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your transaction")
    
    try:
        result = await soft_delete_transaction(session, transaction_id)
        if not result:
            raise HTTPException(status_code=400, detail="Transaction already deleted")
        return {"detail": "deleted"}
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))


