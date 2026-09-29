from sqlalchemy import Column, Integer, String, Numeric, DateTime
from sqlalchemy.sql import func

from app.database.connection import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    category = Column(String(100), nullable=True)
    price = Column(Numeric(10, 2), nullable=False)
    stock_quantity = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())