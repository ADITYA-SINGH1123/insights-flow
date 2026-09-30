from pydantic import BaseModel, EmailStr, ConfigDict, Field


class CustomerCreate(BaseModel):
    name: str = Field(
        ...,
        min_length=2,
        max_length=150
    )
    email: EmailStr | None = None
    phone: str | None = Field(
        default=None,
        max_length=20
    )
    city: str | None = Field(
        default=None,
        max_length=100
    )


class CustomerResponse(BaseModel):
    id: int
    name: str
    email: EmailStr | None
    phone: str | None
    city: str | None

    model_config = ConfigDict(from_attributes=True)