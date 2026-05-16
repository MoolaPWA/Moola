"""add is_deleted columns to users, transactions, categories tables

Revision ID: 8f2c1a3b4d5e
Revises: 640d08a77405
Create Date: 2026-05-12 20:40:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8f2c1a3b4d5e'
down_revision: Union[str, Sequence[str], None] = '640d08a77405'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add is_deleted column to users table
    op.add_column('users', sa.Column('is_deleted', sa.Boolean(), server_default='false', nullable=False))
    op.create_index(op.f('idx_users_is_deleted'), 'users', ['is_deleted'], unique=False)
    
    # Add is_deleted column to transactions table
    op.add_column('transactions', sa.Column('is_deleted', sa.Boolean(), server_default='false', nullable=False))
    op.create_index(op.f('idx_transactions_is_deleted'), 'transactions', ['is_deleted'], unique=False)
    
    # Add is_deleted column to categories table
    op.add_column('categories', sa.Column('is_deleted', sa.Boolean(), server_default='false', nullable=False))
    op.create_index(op.f('idx_categories_is_deleted'), 'categories', ['is_deleted'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    # Drop is_deleted column from categories table
    op.drop_index(op.f('idx_categories_is_deleted'), table_name='categories')
    op.drop_column('categories', 'is_deleted')
    
    # Drop is_deleted column from transactions table
    op.drop_index(op.f('idx_transactions_is_deleted'), table_name='transactions')
    op.drop_column('transactions', 'is_deleted')
    
    # Drop is_deleted column from users table
    op.drop_index(op.f('idx_users_is_deleted'), table_name='users')
    op.drop_column('users', 'is_deleted')
