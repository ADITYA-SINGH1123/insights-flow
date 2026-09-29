from pydantic import BaseModel, EmailStr, ConfigDict


class CustomerCreate(BaseModel):
    name: str
    email: EmailStr | None = None
    phone: str | None = None
    city: str | None = None


class CustomerResponse(BaseModel):
    id: int
    name: str
    email: EmailStr | None
    phone: str | None
    city: str | None

    model_config = ConfigDict(from_attributes=True)