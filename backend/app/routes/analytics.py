from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
import pandas as pd
import numpy as np

from app.database.connection import get_db
from app.models.sale import Sale
from app.models.product import Product
from app.models.customer import Customer
from app.core.security import get_current_user


router = APIRouter(
    prefix="/api/analytics",
    tags=["Analytics"]
)


# =========================
# Period Filter Helper
# =========================
def apply_period_filter(df, period):
    if df.empty:
        return df

    today = pd.Timestamp.now().normalize()

    if period == "1":
        # Today
        df = df[
            df["sale_date"].dt.normalize() == today
        ]

    elif period == "7":
        # Last 7 days including today
        start_date = today - pd.Timedelta(days=6)

        df = df[
            (df["sale_date"].dt.normalize() >= start_date) &
            (df["sale_date"].dt.normalize() <= today)
        ]

    elif period == "30":
        # Last 30 days including today
        start_date = today - pd.Timedelta(days=29)

        df = df[
            (df["sale_date"].dt.normalize() >= start_date) &
            (df["sale_date"].dt.normalize() <= today)
        ]

    elif period == "month":
        # Current month
        df = df[
            (df["sale_date"].dt.year == today.year) &
            (df["sale_date"].dt.month == today.month)
        ]

    return df


# =========================
# Analytics Summary
# =========================
@router.get("/summary")
def analytics_summary(
    period: str = Query(
        "30",
        pattern="^(1|7|30|month)$"
    ),
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sales = db.query(Sale).all()

    if not sales:
        return {
            "total_revenue": 0,
            "total_orders": 0,
            "total_quantity": 0,
            "average_order_value": 0
        }

    data = [
        {
            "id": sale.id,
            "quantity": sale.quantity,
            "total_amount": float(sale.total_amount),
            "sale_date": sale.sale_date
        }
        for sale in sales
    ]

    df = pd.DataFrame(data)

    df["sale_date"] = pd.to_datetime(
        df["sale_date"]
    )

    # Apply period filter
    df = apply_period_filter(
        df,
        period
    )

    # No sales in selected period
    if df.empty:
        return {
            "total_revenue": 0,
            "total_orders": 0,
            "total_quantity": 0,
            "average_order_value": 0
        }

    total_revenue = float(
        np.sum(df["total_amount"])
    )

    total_orders = int(
        len(df)
    )

    total_quantity = int(
        np.sum(df["quantity"])
    )

    average_order_value = float(
        np.mean(df["total_amount"])
    )

    return {
        "total_revenue": total_revenue,
        "total_orders": total_orders,
        "total_quantity": total_quantity,
        "average_order_value": average_order_value
    }


# =========================
# Top Products
# =========================
@router.get("/top-products")
def top_products(
    period: str = Query(
        "30",
        pattern="^(1|7|30|month)$"
    ),
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sales = db.query(Sale).all()

    if not sales:
        return []

    data = [
        {
            "product_id": sale.product_id,
            "quantity": sale.quantity,
            "revenue": float(sale.total_amount),
            "sale_date": sale.sale_date
        }
        for sale in sales
    ]

    df = pd.DataFrame(data)

    df["sale_date"] = pd.to_datetime(
        df["sale_date"]
    )

    # Apply selected period
    df = apply_period_filter(
        df,
        period
    )

    if df.empty:
        return []

    result = (
        df.groupby("product_id")
        .agg(
            total_quantity=("quantity", "sum"),
            total_revenue=("revenue", "sum")
        )
        .reset_index()
        .sort_values(
            "total_revenue",
            ascending=False
        )
    )

    products = []

    for _, row in result.iterrows():

        product = db.query(Product).filter(
            Product.id == int(row["product_id"])
        ).first()

        if product:
            products.append({
                "product_id": product.id,
                "product_name": product.name,
                "category": product.category,
                "total_quantity": int(
                    row["total_quantity"]
                ),
                "total_revenue": float(
                    np.round(
                        row["total_revenue"],
                        2
                    )
                )
            })

    return products


# =========================
# Monthly Sales
# =========================
@router.get("/monthly-sales")
def monthly_sales(
    period: str = Query(
        "30",
        pattern="^(1|7|30|month)$"
    ),
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sales = db.query(Sale).all()

    if not sales:
        return []

    data = [
        {
            "sale_date": sale.sale_date,
            "total_amount": float(sale.total_amount),
            "quantity": sale.quantity
        }
        for sale in sales
    ]

    df = pd.DataFrame(data)

    df["sale_date"] = pd.to_datetime(
        df["sale_date"]
    )

    # Apply selected period
    df = apply_period_filter(
        df,
        period
    )

    if df.empty:
        return []

    df["month"] = df["sale_date"].dt.strftime(
        "%Y-%m"
    )

    result = (
        df.groupby("month")
        .agg(
            total_revenue=("total_amount", "sum"),
            total_orders=("sale_date", "count"),
            total_quantity=("quantity", "sum")
        )
        .reset_index()
        .sort_values("month")
    )

    return [
        {
            "month": row["month"],
            "total_revenue": float(
                np.round(
                    row["total_revenue"],
                    2
                )
            ),
            "total_orders": int(
                row["total_orders"]
            ),
            "total_quantity": int(
                row["total_quantity"]
            )
        }
        for _, row in result.iterrows()
    ]


# =========================
# Customer Analytics
# =========================
@router.get("/customers")
def customer_analytics(
    period: str = Query(
        "30",
        pattern="^(1|7|30|month)$"
    ),
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sales = db.query(Sale).all()

    if not sales:
        return []

    data = [
        {
            "customer_id": sale.customer_id,
            "quantity": sale.quantity,
            "revenue": float(sale.total_amount),
            "sale_date": sale.sale_date
        }
        for sale in sales
    ]

    df = pd.DataFrame(data)

    df["sale_date"] = pd.to_datetime(
        df["sale_date"]
    )

    # Apply selected period
    df = apply_period_filter(
        df,
        period
    )

    if df.empty:
        return []

    result = (
        df.groupby("customer_id")
        .agg(
            total_orders=("customer_id", "count"),
            total_quantity=("quantity", "sum"),
            total_revenue=("revenue", "sum")
        )
        .reset_index()
        .sort_values(
            "total_revenue",
            ascending=False
        )
    )

    customers = []

    for _, row in result.iterrows():

        customer = db.query(Customer).filter(
            Customer.id == int(row["customer_id"])
        ).first()

        if customer:
            customers.append({
                "customer_id": customer.id,
                "customer_name": customer.name,
                "total_orders": int(
                    row["total_orders"]
                ),
                "total_quantity": int(
                    row["total_quantity"]
                ),
                "total_revenue": float(
                    np.round(
                        row["total_revenue"],
                        2
                    )
                )
            })

    return customers


# =========================
# Daily Sales Trends
# =========================
@router.get("/daily-sales")
def daily_sales(
    period: str = Query(
        "30",
        pattern="^(1|7|30|month)$"
    ),
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sales = db.query(Sale).all()

    if not sales:
        return []

    data = [
        {
            "sale_date": sale.sale_date,
            "total_amount": float(sale.total_amount),
            "quantity": sale.quantity
        }
        for sale in sales
    ]

    df = pd.DataFrame(data)

    df["sale_date"] = pd.to_datetime(
        df["sale_date"]
    )

    # Apply selected period
    df = apply_period_filter(
        df,
        period
    )

    # No sales in selected period
    if df.empty:
        return []

    df["date"] = df["sale_date"].dt.strftime(
        "%Y-%m-%d"
    )

    result = (
        df.groupby("date")
        .agg(
            total_revenue=("total_amount", "sum"),
            total_orders=("date", "count"),
            total_quantity=("quantity", "sum")
        )
        .reset_index()
        .sort_values("date")
    )

    return [
        {
            "date": row["date"],
            "total_revenue": float(
                np.round(
                    row["total_revenue"],
                    2
                )
            ),
            "total_orders": int(
                row["total_orders"]
            ),
            "total_quantity": int(
                row["total_quantity"]
            )
        }
        for _, row in result.iterrows()
    ]