# utils/supabase_client.py
import os
import httpx

SUPABASE_URL = os.getenv("SUPABASE_URL")
SERVICE_ROLE_KEY = os.getenv("SERVICE_ROLE_KEY")

if not SUPABASE_URL:
    raise RuntimeError("SUPABASE_URL must be set in environment")

async def get_user_from_supabase(token: str) -> dict | None:
    """
    Verifies the token by calling Supabase's /auth/v1/user endpoint.
    Returns user dict on success, else None.
    """
    if not SERVICE_ROLE_KEY:
        raise RuntimeError("SUPABASE_SERVICE_ROLE_KEY not set; cannot call Supabase admin endpoint")

    headers = {
        "Authorization": f"Bearer {token}",
        "apikey": SERVICE_ROLE_KEY,            # required by Supabase admin endpoints
    }
    url = f"{SUPABASE_URL}/auth/v1/user"
    async with httpx.AsyncClient(timeout=10.0) as client:
        r = await client.get(url, headers=headers)
        if r.status_code == 200:
            return r.json()
        return None

from supabase import create_client, Client

_supabase_client: Client | None = None
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

def get_supabase_client() -> Client:
    """
    Returns a singleton Supabase client initialized with the ANON key.
    Use this for client-side operations (like auth.sign_up) proxied by the backend.
    """
    global _supabase_client
    if _supabase_client is None:
        if not SUPABASE_URL or not SUPABASE_KEY:
            # Fallback or error? For now, raise.
            raise RuntimeError("SUPABASE_URL and SUPABASE_KEY (Anon) must be set in environment")
        _supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
    return _supabase_client
