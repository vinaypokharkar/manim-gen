from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import generation, validation, rendering, protected, auth, chats
import os

app = FastAPI(title="Simple Manim Runner")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*"
    ],  # Add your frontend URLs here
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allows all headers
)

app.include_router(generation.router, prefix="/api")
app.include_router(validation.router, prefix="/api")
app.include_router(rendering.router, prefix="/api")
app.include_router(protected.router, prefix="/api")
app.include_router(auth.router, prefix="/api/auth")
app.include_router(chats.router, prefix="/api/chats")


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


@app.get("/")
async def root():
    return {"msg": "ok"}