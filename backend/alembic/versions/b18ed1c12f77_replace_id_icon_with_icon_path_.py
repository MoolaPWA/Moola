"""replace id_icon with icon_path, background_color, icon_color

Revision ID: b18ed1c12f77
Revises: 8f2c1a3b4d5e
Create Date: 2026-05-12 21:52:33.222574

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b18ed1c12f77'
down_revision: Union[str, Sequence[str], None] = '8f2c1a3b4d5e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.drop_column('categories', 'id_icon')
    op.add_column('categories', sa.Column('icon_path', sa.String(255), nullable=False, server_default='default_icon'))
    op.add_column('categories', sa.Column('background_color', sa.String(7), nullable=False, server_default='#FFFFFF'))
    op.add_column('categories', sa.Column('icon_color', sa.String(7), nullable=False, server_default='#000000'))


def downgrade() -> None:
    """Downgrade schema."""
    pass
