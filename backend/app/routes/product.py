from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductResponse
from app.core.security import get_current_user


router = APIRouter(
    prefix="/api/products",
    tags=["Products"]
)


@router.get("/")
def get_products(
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    products = (
        db.query(Product)
        .order_by(Product.name.asc())
        .all()
    )

    return [
        {
            "id": product.id,
            "name": product.name,
            "category": product.category,
            "price": product.price,
            "stock_quantity": product.stock_quantity
        }
        for product in products
    ]


@router.post(
    "/",
    response_model=ProductResponse
)
def create_product(
    product_data: ProductCreate,
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not product_data.name.strip():
        raise HTTPException(
            status_code=400,
            detail="Product name is required"
        )

    if product_data.price <= 0:
        raise HTTPException(
            status_code=400,
            detail="Product price must be greater than 0"
        )

    if product_data.stock_quantity < 0:
        raise HTTPException(
            status_code=400,
            detail="Stock quantity cannot be negative"
        )

    new_product = Product(
        name=product_data.name.strip(),
        category=(
            product_data.category.strip()
            if product_data.category
            else None
        ),
        price=product_data.price,
        stock_quantity=product_data.stock_quantity
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return new_product