"""initial schema with timestamptz and indexes

Revision ID: 95a7ff1ffd91
Revises: 
Create Date: 2026-04-28 22:29:54.679916

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '95a7ff1ffd91'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. ENUM с приведением
    op.alter_column('categories', 'type',
               existing_type=sa.VARCHAR(length=10),
               type_=sa.Enum('income', 'expense', name='transactiontype'),
               existing_nullable=False,
               postgresql_using='type::transactiontype')

    op.alter_column('transactions', 'type',
               existing_type=sa.VARCHAR(length=10),
               type_=sa.Enum('income', 'expense', name='transactiontype'),
               existing_nullable=False,
               postgresql_using='type::transactiontype')

    # 2. Другие изменения типов
    op.alter_column('categories', 'cat_limit',
               existing_type=sa.NUMERIC(precision=12, scale=2),
               type_=sa.Numeric(precision=10, scale=2),
               existing_nullable=True)

    op.alter_column('categories', 'id_icon',
               existing_type=sa.VARCHAR(length=50),
               nullable=True,
               existing_server_default=sa.text("'default_icon'::character varying"))

    # 3. Индекс для refresh_tokens (если его ещё нет — создаём)
    op.execute("CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens (token)")

    # 4. Индекс для transactions с DESC (пересоздавать не обязательно, если он уже правильный)
    # Но если вы хотите убедиться в правильности направления, можно выполнить:
    op.execute("DROP INDEX IF EXISTS idx_transactions_user_date")
    op.execute("CREATE INDEX idx_transactions_user_date ON transactions (user_id, transaction_date DESC)")

    # 5. Индекс users.email не трогаем — он уже существует.


def downgrade() -> None:
    # Откат изменений в обратном порядке
    op.drop_index('idx_users_email', table_name='users')
    op.drop_index('idx_transactions_user_date', table_name='transactions')
    op.drop_index('idx_refresh_tokens_token', table_name='refresh_tokens')

    op.alter_column('categories', 'id_icon',
               existing_type=sa.VARCHAR(length=50),
               nullable=False,
               existing_server_default=sa.text("'default_icon'::character varying"))

    op.alter_column('categories', 'cat_limit',
               existing_type=sa.Numeric(precision=10, scale=2),
               type_=sa.NUMERIC(precision=12, scale=2),
               existing_nullable=True)

    # Возвращаем тип обратно к VARCHAR
    op.alter_column('transactions', 'type',
               existing_type=sa.Enum('income', 'expense', name='transactiontype'),
               type_=sa.VARCHAR(length=10),
               existing_nullable=False)

    op.alter_column('categories', 'type',
               existing_type=sa.Enum('income', 'expense', name='transactiontype'),
               type_=sa.VARCHAR(length=10),
               existing_nullable=False)