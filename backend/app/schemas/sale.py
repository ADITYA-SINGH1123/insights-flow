from pydantic import BaseModel, ConfigDict, Field
from decimal import Decimal
from datetime import datetime


class SaleCreate(BaseModel):
    customer_id: int = Field(
        ...,
        gt=0
    )
    product_id: int = Field(
        ...,
        gt=0
    )
    quantity: int = Field(
        ...,
        gt=0
    )


class SaleResponse(BaseModel):
    id: int
    customer_id: int
    product_id: int
    quantity: int
    unit_price: Decimal
    total_amount: Decimal
    sale_date: datetime

    model_config = ConfigDict(
        from_attributes=True
    )


# =========================
# Dashboard Sale Response
# =========================

class SaleDashboardResponse(BaseModel):
    id: int
    customer_id: int
    customer_name: str
    product_id: int
    product_name: str
    quantity: int
    unit_price: Decimal
    total_amount: Decimal
    sale_date: datetime

    model_config = ConfigDict(
        from_attributes=True
    )