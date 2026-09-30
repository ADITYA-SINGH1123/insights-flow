from pydantic import BaseModel, ConfigDict, Field
from decimal import Decimal


class ProductCreate(BaseModel):
    name: str = Field(
        ...,
        min_length=1,
        max_length=150
    )
    category: str | None = Field(
        default=None,
        max_length=100
    )
    price: Decimal = Field(
        ...,
        gt=0
    )
    stock_quantity: int = Field(
        default=0,
        ge=0
    )


class ProductResponse(BaseModel):
    id: int
    name: str
    category: str | None
    price: Decimal
    stock_quantity: int

    model_config = ConfigDict(from_attributes=True)