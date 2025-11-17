from fastapi import FastAPI
from routes import generation, validation, rendering
import os

app = FastAPI(title="Simple Manim Runner")

app.include_router(generation.router, prefix="/api")
app.include_router(validation.router, prefix="/api")
app.include_router(rendering.router, prefix="/api")

@app.get("/debug/supabase")
def debug_supabase():
    """Debug endpoint to check Supabase configuration."""
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY")
    SUPABASE_BUCKET = os.getenv("SUPABASE_BUCKET", "videos")
    try:
        from supabase import create_client
        _supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        client_initialized = _supabase is not None
    except Exception:
        client_initialized = False
        
    return {
        "supabase_url": SUPABASE_URL or "NOT SET",
        "supabase_key": "***" if SUPABASE_KEY else "NOT SET",
        "supabase_bucket": SUPABASE_BUCKET,
        "client_initialized": client_initialized,
    }