from fastapi import APIRouter
from models.schemas import CodeRequest, CombinedGenerateRenderRequest, CombinedGenerateRenderResponse
from controllers.render_controller import render_code, generate_and_render
from fastapi.responses import FileResponse
import os
from fastapi import HTTPException

router = APIRouter()

@router.post("/render")
async def render_endpoint(req: CodeRequest):
    return await render_code(req)

@router.post("/generate-and-render", response_model=CombinedGenerateRenderResponse)
async def generate_and_render_endpoint(req: CombinedGenerateRenderRequest):
    return await generate_and_render(req)

@router.get("/videos/{filename}")
def download_video(filename: str):
    """Serve a previously generated video file from `generated_videos/`."""
    dest_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "generated_videos")
    path = os.path.join(dest_dir, filename)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(path, media_type="video/mp4", filename=filename)
