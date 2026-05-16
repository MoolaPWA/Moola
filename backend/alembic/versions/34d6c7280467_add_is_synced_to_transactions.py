"""add is_synced to transactions

Revision ID: 34d6c7280467
Revises: b18ed1c12f77
Create Date: 2026-05-14 22:50:44.495736

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '34d6c7280467'
down_revision: Union[str, Sequence[str], None] = 'b18ed1c12f77'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('transactions', sa.Column('is_synced', sa.Boolean(), server_default='false', nullable=False))


def downgrade() -> None:
    op.drop_column('transactions', 'is_synced')
    pass
