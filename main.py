"""FastAPI application entry point for YourFin."""

from contextlib import asynccontextmanager
import json
import os
from decimal import Decimal
from pathlib import Path
from uuid import UUID, uuid4

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field, field_validator
from psycopg2 import Error as PsycopgError
from dotenv import load_dotenv

from database import get_connection, initialize_database

load_dotenv(Path(__file__).resolve().parent / ".env")

ALLOWED_PURPOSES = {"home", "car", "education", "medical", "debt", "business", "other"}


class PersonalInfoRequest(BaseModel):
    """Contact information submitted with a loan application."""

    model_config = ConfigDict(str_strip_whitespace=True)

    first_name: str = Field(min_length=2, max_length=100)
    last_name: str = Field(min_length=2, max_length=100)
    email: str = Field(min_length=3, max_length=254)
    phone: str = Field(min_length=7, max_length=30)

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        """Require a basic email shape without an additional dependency."""
        if "@" not in value or value.startswith("@") or value.endswith("@"):
            raise ValueError("Enter a valid email address.")
        return value.lower()


class LoanDetailsRequest(BaseModel):
    """Loan request values collected by the frontend."""

    model_config = ConfigDict(str_strip_whitespace=True)

    amount: Decimal = Field(gt=0, le=Decimal("100000"), max_digits=14, decimal_places=2)
    term: int = Field(gt=0, le=360)
    purpose: str = Field(min_length=1, max_length=50)

    @field_validator("purpose")
    @classmethod
    def validate_purpose(cls, value: str) -> str:
        """Accept only purposes exposed by the current frontend."""
        normalized_value = value.lower()
        if normalized_value not in ALLOWED_PURPOSES:
            raise ValueError("Select a valid loan purpose.")
        return normalized_value


class LoanApplicationRequest(BaseModel):
    """Request payload matching the frontend LoanApplication type."""

    personal_info: PersonalInfoRequest
    loan_details: LoanDetailsRequest


class LoanApplicationResponse(BaseModel):
    """Persisted application identifier and backend decision."""

    id: UUID
    approved: bool
    reason: str


class FinancialProfileRequest(BaseModel):
    """Personal profile values collected by the YourFin onboarding flow."""

    model_config = ConfigDict(str_strip_whitespace=True)

    full_name: str = Field(min_length=2, max_length=200)
    age: int = Field(ge=18, le=120)
    employment_status: str = Field(min_length=1, max_length=50)
    country: str = Field(min_length=2, max_length=20)
    currency: str = Field(min_length=3, max_length=10)
    monthly_income: Decimal = Field(gt=0, le=Decimal("10000000"), max_digits=14, decimal_places=2)


class FinancialDetailsRequest(BaseModel):
    """Monthly financial values collected by the YourFin onboarding flow."""

    housing: Decimal = Field(ge=0, le=Decimal("10000000"), max_digits=14, decimal_places=2)
    food: Decimal = Field(ge=0, le=Decimal("10000000"), max_digits=14, decimal_places=2)
    transportation: Decimal = Field(ge=0, le=Decimal("10000000"), max_digits=14, decimal_places=2)
    shopping: Decimal = Field(ge=0, le=Decimal("10000000"), max_digits=14, decimal_places=2)
    entertainment: Decimal = Field(ge=0, le=Decimal("10000000"), max_digits=14, decimal_places=2)
    subscriptions: Decimal = Field(ge=0, le=Decimal("10000000"), max_digits=14, decimal_places=2)
    other_expenses: Decimal = Field(ge=0, le=Decimal("10000000"), max_digits=14, decimal_places=2)
    current_savings: Decimal = Field(ge=0, le=Decimal("100000000"), max_digits=16, decimal_places=2)
    current_debt: Decimal = Field(ge=0, le=Decimal("100000000"), max_digits=16, decimal_places=2)


class FinancialGoalRequest(BaseModel):
    """A financial goal supplied with a plan request."""

    model_config = ConfigDict(str_strip_whitespace=True)

    name: str = Field(min_length=1, max_length=200)
    target_amount: Decimal = Field(gt=0, le=Decimal("100000000"), max_digits=16, decimal_places=2)
    current_saved: Decimal = Field(ge=0, le=Decimal("100000000"), max_digits=16, decimal_places=2)
    target_date: str = Field(min_length=1, max_length=30)

    @field_validator("current_saved")
    @classmethod
    def validate_current_saved(cls, value: Decimal, info) -> Decimal:
        """Prevent a goal from reporting more savings than its target."""
        target_amount = info.data.get("target_amount")
        if target_amount is not None and value > target_amount:
            raise ValueError("Current saved amount cannot exceed the target amount.")
        return value


class FinancialPlanRequest(BaseModel):
    """The complete onboarding payload sent by the YourFin React frontend."""

    model_config = ConfigDict(str_strip_whitespace=True)

    email: str = Field(min_length=3, max_length=254)
    personal_info: FinancialProfileRequest
    financial_info: FinancialDetailsRequest
    goals: list[FinancialGoalRequest] = Field(min_length=1, max_length=20)

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        """Require a basic email shape without an additional dependency."""
        if "@" not in value or value.startswith("@") or value.endswith("@"):
            raise ValueError("Enter a valid email address.")
        return value.lower()


class FinancialPlanResponse(BaseModel):
    """Confirmation returned once a financial plan request is stored."""

    id: UUID
    message: str


def get_cors_origins() -> list[str]:
    """Read allowed browser origins from the environment for local deployment."""
    configured_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173")
    return [origin.strip() for origin in configured_origins.split(",") if origin.strip()]


def evaluate_loan_application(application: LoanApplicationRequest) -> tuple[bool, str]:
    """Apply the server-side decision rules to a validated application."""
    personal_info = application.personal_info
    loan_details = application.loan_details

    if loan_details.amount > Decimal("20000"):
        return False, "Loan amounts above $20,000 require manual review regardless of eligibility."
    if loan_details.amount <= Decimal("5000") and loan_details.term <= 24:
        return True, "Approved: Loan amount and term within acceptable limits"
    if loan_details.amount <= Decimal("20000") and personal_info.email.endswith(".edu"):
        return True, "Approved: Educational email address detected"
    return False, "Declined: Loan amount or term exceeds our current limits"


@asynccontextmanager
async def lifespan(_: FastAPI):
    """Initialize the required Supabase schema before serving requests."""
    initialize_database()
    yield


app = FastAPI(
    title="YourFin API",
    description="Backend service for the YourFin AI Financial Coach application.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


@app.get("/", tags=["General"])
def root() -> dict[str, str]:
    """Return a simple service greeting."""
    return {"message": "Welcome to the YourFin API"}


@app.get("/health", tags=["General"])
def health_check() -> dict[str, str]:
    """Return a basic health status once startup initialization has succeeded."""
    return {"status": "healthy"}


@app.post(
    "/api/loan-applications",
    response_model=LoanApplicationResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Loan Applications"],
)
def create_loan_application(application: LoanApplicationRequest) -> LoanApplicationResponse:
    """Evaluate and persist a loan application received from the frontend."""
    application_id = uuid4()
    approved, reason = evaluate_loan_application(application)

    try:
        with get_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO public.loan_applications (
                        id, first_name, last_name, email_address, phone_number,
                        loan_amount, loan_term_months, loan_purpose, approved, decision_reason
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
                    """,
                    (
                        str(application_id),
                        application.personal_info.first_name,
                        application.personal_info.last_name,
                        application.personal_info.email,
                        application.personal_info.phone,
                        application.loan_details.amount,
                        application.loan_details.term,
                        application.loan_details.purpose,
                        approved,
                        reason,
                    ),
                )
    except PsycopgError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to save the application. Please try again shortly.",
        ) from error

    return LoanApplicationResponse(id=application_id, approved=approved, reason=reason)


@app.post(
    "/api/financial-plans",
    response_model=FinancialPlanResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Financial Plans"],
)
def create_financial_plan(plan: FinancialPlanRequest) -> FinancialPlanResponse:
    """Persist a financial-profile submission received from the React onboarding flow."""
    plan_id = uuid4()

    try:
        with get_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO public.financial_plan_submissions (
                        id, email_address, full_name, age, employment_status, country, currency,
                        monthly_income, financial_details, goals
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s::jsonb, %s::jsonb);
                    """,
                    (
                        str(plan_id),
                        plan.email,
                        plan.personal_info.full_name,
                        plan.personal_info.age,
                        plan.personal_info.employment_status,
                        plan.personal_info.country,
                        plan.personal_info.currency,
                        plan.personal_info.monthly_income,
                        json.dumps(plan.financial_info.model_dump(mode="json")),
                        json.dumps([goal.model_dump(mode="json") for goal in plan.goals]),
                    ),
                )
    except PsycopgError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to save the financial plan. Please try again shortly.",
        ) from error

    return FinancialPlanResponse(
        id=plan_id,
        message="Your financial profile was saved successfully.",
    )