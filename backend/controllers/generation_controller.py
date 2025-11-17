import os
import re
import json
from typing import Dict, Any

try:
    from dotenv import load_dotenv, find_dotenv
    load_dotenv(find_dotenv(), override=False)
except Exception:
    pass

def get_genai_client():
    try:
        from google import genai
    except Exception as e:
        raise RuntimeError("google-genai not installed. Run: pip install google-genai") from e

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
You are an expert Python code generator for Manim Community (2D) scenes. Produce clean, runnable Manim code that follows these strict rules.

OUTPUT FORMAT (MANDATORY):
1. Return ONLY one fenced python code block (```python ... ```).
2. Immediately after the code block output exactly one metadata line:
   ///METADATA/{{"duration_seconds":30,"estimated_complexity":"low"}}
3. No other text before or after the code block + metadata.

CODE REQUIREMENTS:
- Use exactly this single import only:
  from manim import *
- Define exactly one class named `GeneratedScene` with a `construct(self)` method:
  class GeneratedScene(Scene): def construct(self): ...
- Use `Text()` for text. DO NOT use `Tex()` or `MathTex()` unless the user explicitly requests LaTeX math and you confirm the environment supports LaTeX.
- Do NOT use any of these: os, sys, subprocess, socket, open, eval, exec, importlib, shutil, pathlib, requests, urllib. No file I/O or network calls.
- Do NOT reference or instantiate non-standard or extension classes that are not part of Manim Community v0.19 (e.g. Checkmark, SmoothFadeIn, Bounce). If an icon is needed, draw it manually (e.g. two Line() segments in a VGroup).
- Text sizing:
  - Do NOT use `size=` anywhere.
  - For absolute sizes use `font_size=<number>` (e.g., font_size=36).
  - For fractional scaling use `.scale(<float>)` called on the object (e.g., Text("x").scale(0.35)).
- Camera usage:
  - Do NOT use `self.camera.frame` unless you also inherit from MovingCameraScene.
  - If you need to animate the camera, make the scene class `class GeneratedScene(MovingCameraScene):`.
  - If not using MovingCameraScene, zoom by transforming objects (scale/move) rather than animating camera.frame.
- Animations:
  - Use only valid built-in animations (FadeIn, FadeOut, Create, Write, Transform, MoveAlongPath, LaggedStart, GrowFromCenter).
  - Always pass Mobjects to animations. If animating multiple objects, either call multiple animations (FadeIn(a), FadeIn(b)) or wrap them in VGroup(a,b) then FadeIn(group).
  - NEVER pass plain Python primitives (strings, dicts, lists of primitives) into animations.
- Mobjects & grouping:
  - When creating multiple objects that should animate together, group them with `VGroup(...)`.
  - Use positional methods and vector arithmetic (shift(LEFT), to_edge(UP), move_to(...)).
- No external assets:
  - Avoid SVGMobject or external file usage unless the user provides the asset and you reference it by filename (do not attempt to fetch or create files).
- Keep scenes deterministic and lightweight: avoid large loops or heavy computation. Use short run_time values (0.2–1.5s) for animations.

ROBUSTNESS RULES (prevent common LLM errors):
- If you would produce `FadeIn([a, b])`, instead produce `FadeIn(VGroup(a, b))` or `FadeIn(a); FadeIn(b)`.
- Replace any `size=` with `.scale()` or `font_size=` as appropriate.
- If a checkmark is needed, produce exactly:
    checkmark = VGroup(Line(ORIGIN, RIGHT*0.15 + DOWN*0.05), Line(RIGHT*0.15 + DOWN*0.05, RIGHT*0.45 + UP*0.25)).set_color(WHITE).set_stroke(width=6)
  and then place it with `.move_to(...)`.
- If you include a camera animation, ensure the class inherits from `MovingCameraScene`.
- Ensure all variable names are unique and do not shadow Manim classes or functions (e.g., don’t assign to `FadeIn = ...`).
- The code must be valid Python and use only APIs present in Manim Community v0.19.x.

STYLE GUIDELINES (helpful, not mandatory):
- Keep Construct short and clear; prefer small helper VGroups.
- Use descriptive variable names: client_box, api_box, db_cylinder, cloud_group.
- Use `.wait(0.1)` before/after camera animations to stabilize frames.

Example (the exact style you should produce):
```python
from manim import *

class GeneratedScene(Scene):
    def construct(self):
        title = Text("System Architecture", font_size=40).to_edge(UP)
        self.play(Write(title))
        client = VGroup(Rectangle(width=1.5, height=1), Text("Client", font_size=24)).shift(LEFT*3)
        api = VGroup(Rectangle(width=1.5, height=1), Text("API", font_size=24)).shift(LEFT*0.5)
        self.play(FadeIn(client), FadeIn(api))
        self.wait(1)

Prompt: {user_prompt}
"""

    try:
        print("[LLM] Prompt:", user_prompt)
    except Exception:
        pass

    resp = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    text = getattr(resp, "text", None)
    if not text:
        try:
            text = resp.candidates[0].content[0].text
        except Exception:
            text = str(resp)

    try:
        preview = (text or "")[:1200]
        print("[LLM] Response text:\n", preview)
    except Exception:
        pass

    m = re.search(r"```(?:python)?\n(.*?)\n```", text, re.S)
    if not m:
        raise ValueError("No fenced python code block found in model output.")
    code = m.group(1).strip()

    meta = {}
    mm = re.search(r"///METADATA///\s*(\{.*?\})", text)
    if mm:
        try:
            meta = json.loads(mm.group(1))
        except Exception:
            meta = {}

    os.makedirs("generated_scripts", exist_ok=True)
    path = os.path.join("generated_scripts", "generated_scene.py")
    with open(path, "w", encoding="utf-8") as f:
        f.write(code)

    return {"path": path, "code": code, "metadata": meta}
