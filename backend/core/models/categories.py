from .user import Base
from sqlalchemy import Column, String, UUID, ForeignKey, DECIMAL


class Category(Base):
    __tablename__ = "categories"
    id = Column(UUID(as_uuid=True), primary_key=True, index=True)
    user_id = Column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    cat_limit = Column(DECIMAL(12, 2), nullable=True)
    id_icon = Column(String, nullable=False)
