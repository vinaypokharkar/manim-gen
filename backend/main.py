# api/app.py
import os
import tempfile
import subprocess
import shutil
import uuid
from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
import ast
from fastapi.responses import FileResponse, JSONResponse
from llm_generate import generate_manim_code

# Run with Docker (loads .env for GENAI_API_KEY, etc.)
# docker run --env-file .env -p 8000:8000 your-fastapi-image

app = FastAPI(title="Simple Manim Runner")

class PromptIn(BaseModel):
    prompt: str

class GenerateResponse(BaseModel):
    path: str
    code: str
    metadata: dict

@app.post("/generate", response_model=GenerateResponse)
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
        print(result)

        

# Lightweight AST safety: forbid dangerous names/imports
FORBIDDEN = {"os", "sys", "subprocess", "socket", "open", "__import__", "eval", "exec", "shutil", "pathlib"}

def is_code_safe(code: str):
    try:
        tree = ast.parse(code)
    except Exception as e:
        return False, f"parse_error: {e}"
    for node in ast.walk(tree):
        # imports
        if isinstance(node, ast.Import):
            for n in node.names:
                if n.name.split(".")[0] in FORBIDDEN:
                    return False, f"forbidden import {n.name}"
        if isinstance(node, ast.ImportFrom):
            if (node.module or "").split(".")[0] in FORBIDDEN:
                return False, f"forbidden import from {node.module}"
        # names
        if isinstance(node, ast.Name):
            if node.id in FORBIDDEN:
                return False, f"forbidden name {node.id}"
        # attribute access e.g., os.system
        if isinstance(node, ast.Attribute):
            attr = getattr(node, "attr", None)
            if attr in FORBIDDEN:
                return False, f"forbidden attribute {attr}"
    return True, "ok"

class CodeRequest(BaseModel):
    filename: str = "script.py"      # optional name
    code: str
    scene_class: str = "GeneratedScene"  # class name of the Scene to render
    quality: str = "low"             # low/medium/high (affects manim flags)



@app.post("/render")
async def render_code(req: CodeRequest):
    safe, msg = is_code_safe(req.code)
    if not safe:
        raise HTTPException(status_code=400, detail=f"code rejected: {msg}")

    # make temp dir
    tmp = tempfile.mkdtemp(prefix="manimjob-")
    try:
        script_path = os.path.join(tmp, req.filename)
        with open(script_path, "w", encoding="utf-8") as f:
            f.write(req.code)

        # determine manim quality flags (adjust frame rate / resolution per quality)
        # our Docker image's entrypoint is `manim`
        # -p: preview, -ql quick low quality, -qm medium quality, -qh high quality
        quality_flag = {"low": "-ql", "medium": "-pqm", "high": "-pqh"}.get(req.quality, "-pql")

        out_name = "render"
        cmd = [
            "docker", "run", "--rm",
            "--read-only=false",
            "--network", "none",             # no network inside container
            "-v", f"{tmp}:/work",
            "manim-image:latest",
            quality_flag, f"/work/{req.filename}", req.scene_class,
            "--media_dir", "/work/media",   # ensure manim writes to /work
            "-o", out_name
        ]

        # Optionally add CPU/memory limits
        # Example: add ['--cpus', '0.8', '--memory', '1g'] to cmd before image name if desired

        proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=600)
        stdout = proc.stdout.decode(errors="ignore")
        stderr = proc.stderr.decode(errors="ignore")

        if proc.returncode != 0:
            return JSONResponse(status_code=500, content={"error": "render failed", "stdout": stdout, "stderr": stderr})

        # manim by default outputs to media/videos/<script>/<quality>/<out_name>.mp4
        # Let's search under /work/media for a .mp4
        mp4_path = None
        for root, dirs, files in os.walk(tmp):
            for fn in files:
                if fn.endswith(".mp4"):
                    mp4_path = os.path.join(root, fn)
                    break
            if mp4_path:
                break

        if not mp4_path or not os.path.exists(mp4_path):
            return JSONResponse(status_code=500, content={"error": "no mp4 produced", "stdout": stdout, "stderr": stderr})

        # Persist a copy of the rendered video under a dedicated directory
        dest_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "generated_videos")
        os.makedirs(dest_dir, exist_ok=True)
        dest_filename = f"{out_name}-{uuid.uuid4().hex[:8]}.mp4"
        dest_path = os.path.join(dest_dir, dest_filename)
        try:
            shutil.copy2(mp4_path, dest_path)
        except Exception as copy_err:
            # If copy fails, still attempt to return original from temp
            return FileResponse(mp4_path, media_type="video/mp4", filename=os.path.basename(mp4_path))

        # return the saved copy from the same directory
        return FileResponse(dest_path, media_type="video/mp4", filename=os.path.basename(dest_path))
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=504, detail="render timed out")
    finally:
        # Keep temp for debugging? remove it.
        try:
            shutil.rmtree(tmp)
        except Exception:
            pass
