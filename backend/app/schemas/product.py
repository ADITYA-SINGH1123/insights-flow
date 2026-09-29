from pydantic import BaseModel, ConfigDict
from decimal import Decimal


class ProductCreate(BaseModel):
    name: str
    category: str | None = None
    price: Decimal
    stock_quantity: int = 0


class ProductResponse(BaseModel):
    id: int
    name: str
    category: str | None
    price: Decimal
    stock_quantity: int

    model_config = ConfigDict(from_attributes=True)