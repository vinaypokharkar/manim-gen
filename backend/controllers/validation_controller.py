import ast
import re
from typing import Dict, Any

FORBIDDEN_NAMES = {
    "os", "sys", "subprocess", "socket", "open", "exec", "eval", "importlib",
    "shutil", "pathlib", "requests", "urllib", "__import__", "input"
}

CHECKMARK_REPLACEMENT = """
# Auto-replaced Checkmark (LLM used non-existent class). Draw a simple checkmark:
checkmark = VGroup(
    Line(ORIGIN, RIGHT*0.15 + DOWN*0.05),
    Line(RIGHT*0.15 + DOWN*0.05, RIGHT*0.45 + UP*0.25)
).set_color(WHITE).set_stroke(width=6)
"""

def _replace_size_with_font_size(code: str) -> str:
    # If size=<0-3 treat as scale, else font_size
    # 1) fractional -> convert to .scale(...) by replacing `Text(..., size=0.35)` -> `Text(...).scale(0.35)`
    def scale_repl(m):
        start = m.group(1)
        val = float(m.group(2))
        rest = m.group(3) or ""
        return f"{start}{rest}).scale({val}"
    code = re.sub(r'(Text\([^\)]*?),\s*size\s*=\s*([0-9]*\.?[0-9]+)([^\)]*)\)', scale_repl, code)

    # 2) remaining size= -> font_size=
    code = re.sub(r'\bsize\s*=', 'font_size=', code)
    return code

def _replace_checkmark(code: str) -> str:
    if "Checkmark(" in code:
        # naive single replacement: replace the call site with the replacement block
        code = code.replace("Checkmark(", CHECKMARK_REPLACEMENT + "Checkmark_placeholder(")
        # remove the placeholder call if any (safe guard)
        code = code.replace("Checkmark_placeholder(", "")
    return code

def _replace_tex_with_text(code: str) -> str:
    # Use Text instead of Tex/MathTex to avoid LaTeX dependency by default
    code = code.replace("MathTex(", "Text(")
    code = code.replace("Tex(", "Text(")
    return code

def _ensure_moving_camera(code: str) -> str:
    if "self.camera.frame" in code:
        # ensure import and class change
        if "MovingCameraScene" not in code:
            # add import after from manim import * if present
            if "from manim import *" in code and "from manim import MovingCameraScene" not in code:
                code = code.replace("from manim import *", "from manim import *\nfrom manim import MovingCameraScene")
            # replace Scene base classes (first occurrence)
            code = re.sub(r"class\s+(\w+)\(\s*Scene\s*\)\s*:", r"class \1(MovingCameraScene):", code, count=1)
    return code

def _ast_safety_check(code: str) -> Dict[str, Any]:
    """Parse AST and block forbidden names/usage. Returns dict with ok and errors."""
    errors = []
    try:
        tree = ast.parse(code)
    except SyntaxError as e:
        return {"ok": False, "errors": [f"SyntaxError: {e}"]}

    # walk AST
    for node in ast.walk(tree):
        # forbid imports of dangerous modules
        if isinstance(node, ast.Import):
            for n in node.names:
                if n.name.split('.')[0] in FORBIDDEN_NAMES:
                    errors.append(f"forbidden import: {n.name}")
        if isinstance(node, ast.ImportFrom):
            mod = (node.module or "")
            if mod.split('.')[0] in FORBIDDEN_NAMES:
                errors.append(f"forbidden from-import: {mod}")
        # forbid usage of forbidden names (calls, names)
        if isinstance(node, ast.Name):
            if node.id in FORBIDDEN_NAMES:
                errors.append(f"forbidden name used: {node.id}")
        # forbid attribute access like os.system
        if isinstance(node, ast.Attribute):
            try:
                if isinstance(node.value, ast.Name) and node.value.id in FORBIDDEN_NAMES:
                    errors.append(f"forbidden attribute access: {node.value.id}.{node.attr}")
            except Exception:
                pass
        # forbid exec/eval calls explicitly
        if isinstance(node, ast.Call):
            if isinstance(node.func, ast.Name) and node.func.id in {"eval", "exec", "__import__"}:
                errors.append(f"forbidden call: {node.func.id}()")
    return {"ok": len(errors) == 0, "errors": errors}

def sanitize_and_validate(code: str) -> Dict[str, Any]:
    """
    Sanitize provided Manim code, run AST checks, and ensure it compiles.
    Returns {"ok": True, "sanitized_code": <code>} on success,
    otherwise {"ok": False, "errors": [...], "sanitized_code": <code>}
    """
    if not isinstance(code, str):
        return {"ok": False, "errors": ["code must be a string"]}

    # Basic sanitizers
    code = _replace_size_with_font_size(code)
    code = _replace_checkmark(code)
    code = _replace_tex_with_text(code)
    code = _ensure_moving_camera(code)

    # AST safety
    ast_result = _ast_safety_check(code)
    if not ast_result["ok"]:
        return {"ok": False, "errors": ast_result["errors"], "sanitized_code": code}

    # final compile check
    try:
        compile(code, "<manim_code>", "exec")
    except Exception as e:
        return {"ok": False, "errors": [f"compile error: {e}"], "sanitized_code": code}

    return {"ok": True, "sanitized_code": code}
