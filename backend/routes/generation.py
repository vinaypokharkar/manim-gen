from fastapi import APIRouter, HTTPException
from models.schemas import PromptIn, GenerateResponse
from controllers.generation_controller import generate_manim_code

router = APIRouter()

@router.post("/generate", response_model=GenerateResponse)
def generate_endpoint(req: PromptIn) -> GenerateResponse:
    try:
        print(req.prompt)
        result = generate_manim_code(req.prompt)
        return GenerateResponse(
            path=result["path"],
            code=result.get("code", ""),
            metadata=result.get("metadata", {}),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
