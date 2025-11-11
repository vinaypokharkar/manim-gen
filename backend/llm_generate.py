# api/llm_generate.py
import os, re, json
from typing import Dict, Any

# Load .env if present so GENAI_API_KEY is available during local/dev runs
try:
    from dotenv import load_dotenv, find_dotenv
    load_dotenv(find_dotenv(), override=False)
except Exception:
    # dotenv is optional; we still rely on OS env or ADC if not installed
    pass

def get_genai_client():
    try:
        from google import genai
    except Exception as e:
        raise RuntimeError("google-genai not installed. Run: pip install google-genai") from e

    # Try default credentials like the reference example
    try:
        return genai.Client()
    except Exception:
        api_key = os.getenv("GENAI_API_KEY")
        if api_key:
            return genai.Client(api_key=api_key)
        raise ValueError("Set GENAI_API_KEY or configure Vertex AI ADC (gcloud or service account).")

def generate_manim_code(user_prompt: str) -> Dict[str, Any]:
    client = get_genai_client()

    prompt = f"""
You are a Python code generator for Manim scenes.
RULES:
1) Return exactly one fenced python code block (```python ... ```).
2) Import only: from manim import *
3) Define class GeneratedScene(Scene): def construct(self): ...
4) No os/sys/subprocess/eval/exec/open/socket/shutil/pathlib calls.
5) No preview/gui calls (no xdg-open).
6) After code block include one line: ///METADATA///{{"duration_seconds":<int>,"estimated_complexity":"low"|"medium"|"high"}}
7) No extra text.
Generate a compact System Architecture scene showing client, API, server, database, cloud, arrows, and a small dot moving along arrows once.
Prompt: {user_prompt}
"""

    # Debug: print prompt
    try:
        print("[LLM] Prompt:", user_prompt)
    except Exception:
        pass

    # Correct call: models.generate_content
    resp = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    # Extract text: SDK exposes .text for convenience (or see resp.candidates)
    text = getattr(resp, "text", None)
    if not text:
        # fallback to older/alternate shape: candidates -> content -> text
        try:
            text = resp.candidates[0].content[0].text
        except Exception:
            text = str(resp)

    # Debug: print response text (truncate to keep logs readable)
    try:
        preview = (text or "")[:1200]
        print("[LLM] Response text:\n", preview)
    except Exception:
        pass

    # Extract fenced python code
    m = re.search(r"```(?:python)?\n(.*?)\n```", text, re.S)
    if not m:
        raise ValueError("No fenced python code block found in model output.")
    code = m.group(1).strip()

    # Extract metadata JSON if present
    meta = {}
    mm = re.search(r"///METADATA///\s*(\{.*?\})", text)
    if mm:
        try:
            meta = json.loads(mm.group(1))
        except Exception:
            meta = {}

    # Save file
    os.makedirs("generated_scripts", exist_ok=True)
    path = os.path.join("generated_scripts", "generated_scene.py")
    with open(path, "w", encoding="utf-8") as f:
        f.write(code)

    return {"path": path, "code": code, "metadata": meta}
