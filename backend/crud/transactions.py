from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import UUID, select
from typing import Sequence
from core.models import Transaction
from core.schemas.transaction import TransactionCreate

async def create_transaction(session: AsyncSession, transaction_data: TransactionCreate) -> Transaction:
    new_transaction = Transaction(
        user_id=transaction_data.user_id,
        category_id=transaction_data.category_id,
        amount=transaction_data.amount,
        date=transaction_data.date,
        description=transaction_data.description
    )
    session.add(new_transaction)
    await session.commit()
    await session.refresh(new_transaction)
    return new_transaction

async def get_transactions(session: AsyncSession, user_id: UUID) -> Sequence[Transaction]:
    stmt = select(Transaction).where(Transaction.user_id == user_id)
    result = await session.scalars(stmt)
    return result.all()
