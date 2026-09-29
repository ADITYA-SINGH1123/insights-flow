from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func

from app.database.connection import Base


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, nullable=True, index=True)
    phone = Column(String(20), nullable=True)
    city = Column(String(100), nullable=True)
    created_at = Column(DateTime, server_default=func.now())