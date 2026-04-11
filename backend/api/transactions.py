from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from core import db_helper
from core.schemas.transaction import TransactionCreate, TransactionRead
from crud.transactions import create_transaction, get_transactions

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.post("", response_model=TransactionRead)
async def create_transaction_endpoint(
    transaction_data: TransactionCreate,
    session: AsyncSession = Depends(db_helper.session_getter),
):
    # Здесь можно добавить проверку, что user_id принадлежит текущему пользователю
    return await create_transaction(session, transaction_data)

@router.get("", response_model=list[TransactionRead])
async def list_transactions(
    session: AsyncSession = Depends(db_helper.session_getter),
):
    return await get_transactions(session)