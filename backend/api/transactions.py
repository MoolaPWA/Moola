from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from core import db_helper
from core.schemas.transaction import TransactionCreate, TransactionRead
from crud.transactions import create_transaction, get_transactions
from core.auth import get_current_user
from core.models import User

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.post("", response_model=TransactionRead)
async def create_transaction_endpoint(
    transaction_data: TransactionCreate,
    session: AsyncSession = Depends(db_helper.session_getter),
    current_user: User = Depends(get_current_user),
):
    transaction_data.user_id = current_user.id
    return await create_transaction(session, transaction_data)

@router.get("", response_model=list[TransactionRead])
async def list_transactions(
    session: AsyncSession = Depends(db_helper.session_getter),
    current_user: User = Depends(get_current_user),
):
    return await get_transactions(session, user_id=current_user.id)
