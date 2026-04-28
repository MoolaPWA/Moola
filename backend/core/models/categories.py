import uuid
from sqlalchemy import Column, String, Numeric, ForeignKey, Enum, Index, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.db_helper import Base
import enum

class TransactionType(str, enum.Enum):
    income = "income"
    expense = "expense"

class Category(Base):
    __tablename__ = "categories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    type = Column(Enum(TransactionType), nullable=False)
    cat_limit = Column(Numeric(10, 2), nullable=True)
    id_icon = Column(String, default="default_icon")

    user = relationship("User", back_populates="categories")
    transactions = relationship("Transaction", back_populates="category")

    __table_args__ = (
        Index("idx_categories_user_id", "user_id"),
        UniqueConstraint("user_id", "name", "type", name="categories_user_id_name_type_key"),
    )