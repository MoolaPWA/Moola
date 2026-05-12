from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from typing import List, Sequence, Optional
from uuid import UUID
from core.models import Transaction, Category
from core.schemas.transaction import TransactionCreate

async def get_transaction_by_id(session: AsyncSession, transaction_id: UUID, include_deleted: bool = False) -> Optional[Transaction]:
    stmt = select(Transaction).where(Transaction.id == transaction_id)
    if not include_deleted:
        stmt = stmt.where(Transaction.is_deleted == False)
    result = await session.scalar(stmt)
    return result

async def get_transactions_by_user(
    session: AsyncSession,
    user_id: UUID,
    limit: int = 100,
    offset: int = 0,
    type_filter: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    category_id: Optional[UUID] = None,
    include_deleted: bool = False,
) -> Sequence[Transaction]:
    stmt = select(Transaction).where(Transaction.user_id == user_id)
    if not include_deleted:
        stmt = stmt.where(Transaction.is_deleted == False)
    if type_filter:
        stmt = stmt.where(Transaction.type == type_filter)
    if start_date:
        stmt = stmt.where(Transaction.transaction_date >= start_date)
    if end_date:
        stmt = stmt.where(Transaction.transaction_date <= end_date)
    if category_id:
        stmt = stmt.where(Transaction.category_id == category_id)
    stmt = stmt.order_by(Transaction.transaction_date.desc()).limit(limit).offset(offset)
    result = await session.scalars(stmt)
    return result.all()

async def create_transaction(session: AsyncSession, transaction_data: TransactionCreate) -> Transaction:
    user_id = transaction_data.user_id
    category_id = transaction_data.category_id

    # Валидация: если категория указана, проверить её принадлежность пользователю и соответствие типа
    if category_id:
        category = await session.scalar(select(Category).where(Category.id == category_id, Category.is_deleted == False))
        if not category:
            raise ValueError(f"Category with id '{category_id}' not found")
        if category.user_id != user_id:
            raise ValueError("Category does not belong to this user")
        if category.type != transaction_data.type:
            raise ValueError(f"Transaction type '{transaction_data.type}' does not match category type '{category.type}'")

        # Валидация лимита категории (только для расходов)
        if transaction_data.type == 'expense' and category.cat_limit is not None:
            # Подсчитываем сумму расходов за текущий месяц по этой категории
            from datetime import datetime, timezone
            now = datetime.now(timezone.utc)
            start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            stmt = select(Transaction).where(
                Transaction.user_id == user_id,
                Transaction.category_id == category_id,
                Transaction.transaction_date >= start_of_month,
                Transaction.is_deleted == False
            )
            result = await session.scalars(stmt)
            total_spent = sum(t.amount for t in result) if result else 0
            if total_spent + transaction_data.amount > category.cat_limit:
                raise ValueError(f"Exceeds category limit of {category.cat_limit}")

    new_transaction = Transaction(
        user_id=user_id,
        category_id=category_id,
        amount=transaction_data.amount,
        type=transaction_data.type,
        transaction_date=transaction_data.transaction_date,
        description=transaction_data.description
    )
    session.add(new_transaction)
    await session.commit()
    await session.refresh(new_transaction)
    return new_transaction

async def update_transaction(
    session: AsyncSession,
    transaction_id: UUID,
    **kwargs
) -> Optional[Transaction]:
    existing = await get_transaction_by_id(session, transaction_id)
    if not existing:
        raise ValueError("Transaction not found")

    # Если обновляется category_id, провести те же проверки
    if 'category_id' in kwargs:
        new_cat_id = kwargs['category_id']
        if new_cat_id:
            category = await session.scalar(select(Category).where(Category.id == new_cat_id, Category.is_deleted == False))
            if not category:
                raise ValueError(f"Category not found: {new_cat_id}")
            if category.user_id != existing.user_id:
                raise ValueError("Category does not belong to this user")
            # Тип категории должен совпадать с типом транзакции
            ttype = kwargs.get('type', existing.type)
            if category.type != ttype:
                raise ValueError("Category type mismatch")
        # Если передали None, значит, отвязать категорию – разрешено

    stmt = update(Transaction).where(Transaction.id == transaction_id).values(**kwargs).returning(Transaction)
    result = await session.execute(stmt)
    await session.commit()
    return result.scalar_one_or_none()

async def soft_delete_transaction(session: AsyncSession, transaction_id: UUID) -> bool:
    """Perform soft delete on transaction - sets is_deleted=True and updates updated_at"""
    transaction = await get_transaction_by_id(session, transaction_id, include_deleted=False)
    if not transaction:
        return False
    if transaction.is_deleted:
        raise ValueError("Transaction is already deleted")
    
    stmt = update(Transaction).where(Transaction.id == transaction_id).values(is_deleted=True).returning(Transaction)
    result = await session.execute(stmt)
    await session.commit()
    return result.rowcount > 0

async def delete_transaction(session: AsyncSession, transaction_id: UUID) -> bool:
    stmt = delete(Transaction).where(Transaction.id == transaction_id)
    result = await session.execute(stmt)
    await session.commit()
    return result.rowcount > 0

async def patch_transaction(
    session: AsyncSession,
    transaction_id: UUID,
    user_id: UUID,
    patch_data: dict,
) -> Optional[Transaction]:
    transaction = await get_transaction_by_id(session, transaction_id)
    if not transaction or transaction.user_id != user_id:
        raise ValueError("Transaction not found or not owned by user")
    
    # Если обновляется category_id, проверить принадлежность и тип
    if 'category_id' in patch_data and patch_data['category_id'] is not None:
        cat_id = patch_data['category_id']
        category = await session.scalar(select(Category).where(Category.id == cat_id, Category.is_deleted == False))
        if not category or category.user_id != user_id:
            raise ValueError("Category not found or not owned by user")
        # Тип транзакции может быть обновлён одновременно
        new_type = patch_data.get('type', transaction.type)
        if category.type != new_type:
            raise ValueError("Category type does not match transaction type")
    
    # Применяем изменения
    for key, value in patch_data.items():
        setattr(transaction, key, value)
    await session.commit()
    await session.refresh(transaction)
    return transaction

async def patch_transactions_bulk(
    session: AsyncSession,
    user_id: UUID,
    updates: List[dict],  # каждый элемент: {"id": UUID, **patch_data}
) -> List[Transaction]:
    updated_transactions = []
    for update in updates:
        tx_id = update.pop('id')
        tx = await patch_transaction(session, tx_id, user_id, update)
        if tx:
            updated_transactions.append(tx)
    return updated_transactions
