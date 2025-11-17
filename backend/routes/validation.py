from fastapi import APIRouter
from models.schemas import ValidationRequest, ValidationResponse
from controllers.validation_controller import sanitize_and_validate

router = APIRouter()

@router.post("/validate", response_model=ValidationResponse)
def validate_endpoint(req: ValidationRequest) -> ValidationResponse:
    result = sanitize_and_validate(req.code)
    if result.get("ok"):
        return ValidationResponse(ok=True, sanitized_code=result.get("sanitized_code"))
    return ValidationResponse(
        ok=False,
        errors=result.get("errors", []),
        sanitized_code=result.get("sanitized_code"),
    )
