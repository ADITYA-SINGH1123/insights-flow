from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db

from app.models.sale import Sale
from app.models.customer import Customer
from app.models.product import Product

from app.schemas.sale import (
    SaleCreate,
    SaleResponse,
    SaleDashboardResponse,
)

from app.core.security import get_current_user


router = APIRouter(
    prefix="/api/sales",
    tags=["Sales"]
)


# =========================
# Create Sale
# =========================

@router.post(
    "/",
    response_model=SaleResponse
)
def create_sale(
    sale_data: SaleCreate,
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    # Check customer
    customer = (
        db.query(Customer)
        .filter(
            Customer.id == sale_data.customer_id
        )
        .first()
    )

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )


    # Check product
    product = (
        db.query(Product)
        .filter(
            Product.id == sale_data.product_id
        )
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )


    # Validate quantity
    if sale_data.quantity <= 0:
        raise HTTPException(
            status_code=400,
            detail="Quantity must be greater than 0"
        )


    # Check stock
    if product.stock_quantity < sale_data.quantity:
        raise HTTPException(
            status_code=400,
            detail="Insufficient stock"
        )


    # Calculate sale
    unit_price = product.price

    total_amount = (
        unit_price * sale_data.quantity
    )


    # Create sale
    new_sale = Sale(
        customer_id=sale_data.customer_id,
        product_id=sale_data.product_id,
        quantity=sale_data.quantity,
        unit_price=unit_price,
        total_amount=total_amount
    )


    # Reduce stock
    product.stock_quantity -= (
        sale_data.quantity
    )


    db.add(new_sale)

    db.commit()

    db.refresh(new_sale)

    return new_sale


# =========================
# Get Recent Sales
# =========================

@router.get(
    "/",
    response_model=list[SaleDashboardResponse]
)
def get_sales(
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    sales = (
        db.query(
            Sale,
            Customer.name.label("customer_name"),
            Product.name.label("product_name")
        )
        .join(
            Customer,
            Sale.customer_id == Customer.id
        )
        .join(
            Product,
            Sale.product_id == Product.id
        )
        .order_by(
            Sale.sale_date.desc()
        )
        .all()
    )


    result = []

    for sale, customer_name, product_name in sales:

        result.append(
            {
                "id": sale.id,
                "customer_id": sale.customer_id,
                "customer_name": customer_name,
                "product_id": sale.product_id,
                "product_name": product_name,
                "quantity": sale.quantity,
                "unit_price": sale.unit_price,
                "total_amount": sale.total_amount,
                "sale_date": sale.sale_date,
            }
        )


    return result