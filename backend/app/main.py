from fastapi import FastAPI
import os
from fastapi.middleware.cors import CORSMiddleware
from app.routes.user import router as user_router
from app.routes.product import router as product_router
from app.routes.customer import router as customer_router
from app.routes.sale import router as sale_router
from app.routes.analytics import router as analytics_router
app = FastAPI(
    title="Insights Flow API",
    description="Sales Analytics Dashboard Backend",
    version="1.0.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:5173")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_router)
app.include_router(product_router)
app.include_router(customer_router)
app.include_router(sale_router)
app.include_router(analytics_router)

@app.get("/")
def root():
    return {
        "message": "Welcome to Insights Flow API",
        "status": "running",
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Insights Flow Backend",
    }