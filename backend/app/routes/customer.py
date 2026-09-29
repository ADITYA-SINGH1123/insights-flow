from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.customer import Customer
from app.schemas.customer import CustomerCreate, CustomerResponse
from app.core.security import get_current_user


router = APIRouter(
    prefix="/api/customers",
    tags=["Customers"]
)


# =========================
# Get Customers
# =========================

@router.get("/")
def get_customers(
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    customers = (
        db.query(Customer)
        .order_by(Customer.name.asc())
        .all()
    )

    return [
        {
            "id": customer.id,
            "name": customer.name,
            "email": customer.email,
            "phone": customer.phone,
            "city": customer.city
        }
        for customer in customers
    ]


# =========================
# Create Customer
# =========================

@router.post(
    "/",
    response_model=CustomerResponse
)
def create_customer(
    customer_data: CustomerCreate,
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    # Check duplicate email
    if customer_data.email:
        existing_customer = (
            db.query(Customer)
            .filter(
                Customer.email ==
                customer_data.email
            )
            .first()
        )

        if existing_customer:
            raise HTTPException(
                status_code=400,
                detail="Customer with this email already exists"
            )

    new_customer = Customer(
        name=customer_data.name.strip(),
        email=(
            str(customer_data.email)
            if customer_data.email
            else None
        ),
        phone=(
            customer_data.phone.strip()
            if customer_data.phone
            else None
        ),
        city=(
            customer_data.city.strip()
            if customer_data.city
            else None
        )
    )

    db.add(new_customer)

    db.commit()

    db.refresh(new_customer)

    return new_customer