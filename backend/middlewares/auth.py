# middlewares/auth.py
import os
from typing import Optional, Dict, Any

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from datetime import datetime, timezone

from utils.supabase_client import get_user_from_supabase

security = HTTPBearer(auto_error=False)

SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")  # optional, for local HS256 verification
SUPABASE_AUD = os.getenv("SUPABASE_AUD")  # optional audience check if you set it in Supabase
# If SUPABASE_JWT_SECRET is not provided, we fall back to calling Supabase admin endpoint.

class AuthUser:
    """
    Simple container for user info you will get from Supabase.
    Add fields you care about (email, sub, role, app_metadata, user_metadata, etc.)
    """
    def __init__(self, raw: Dict[str, Any]):
        self.raw = raw
        self.id = raw.get("id") or raw.get("sub") or raw.get("aud")  # flexible
        self.email = raw.get("email") or raw.get("user_metadata", {}).get("email")
        self.role = raw.get("role") or raw.get("app_metadata", {}).get("role")
        # copy any other fields you want e.g. phone, confirmed_at, etc.
        self.raw = raw

async def _verify_jwt_locally(token: str) -> Optional[Dict[str, Any]]:
    """
    Verify JWT using SUPABASE_JWT_SECRET (HS256).
    Returns payload dict on success or None on failure.
    """
    if not SUPABASE_JWT_SECRET:
        return None

    try:
        # Supabase typically uses HS256 when JWT secret is set. Adjust algorithm if needed.
        payload = jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=["HS256"])
        # Optional checks:
        if SUPABASE_AUD:
            aud = payload.get("aud")
            if aud != SUPABASE_AUD:
                return None
        # expiry check handled by jose
        return payload
    except JWTError:
        return None

async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> AuthUser:
    """
    Dependency for routes. Returns AuthUser or raises 401.
    Behavior:
      - If SUPABASE_JWT_SECRET is set: try local verification (fast).
      - Otherwise: call Supabase /auth/v1/user endpoint (requires service_role key).
    """
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing or invalid auth header")

    token = credentials.credentials

    # 1) Try local verification if configured
    payload = await _verify_jwt_locally(token)
    if payload:
        # Check active status
        user_id = payload.get("sub")
        if not await check_user_active(user_id):
             raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User account is inactive")

        # Optional: basic sanity checks
        exp = payload.get("exp")
        if exp is not None:
            now = datetime.now(tz=timezone.utc).timestamp()
            if now > float(exp):
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")

        # Build AuthUser from payload (Supabase user claims are often inside 'user' or top-level claims)
        # We'll standardize common fields.
        user_info = {
            "id": user_id,
            "email": payload.get("email"),
            "role": payload.get("role") or payload.get("app_metadata", {}).get("role"),
            **payload
        }
        return AuthUser(user_info)

    # 2) Fall back to Supabase admin verify (server call)
    user = await get_user_from_supabase(token)
    if user:
        user_id = user.get("id")
        if not await check_user_active(user_id):
             raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User account is inactive")
        return AuthUser(user)

    # If none succeeded, unauthorized
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

async def check_user_active(user_id: str):
    """
    Helper to check if a user is active in public.profiles.
    """
    from utils.supabase_client import get_supabase_client
    supabase = get_supabase_client()
    try:
        # Use single() to expected exactly one row
        res = supabase.table("profiles").select("is_active").eq("id", user_id).single()
        if res.data and not res.data.get("is_active", True):
            return False
        return True
    except Exception:
        # If profile doesn't exist, assume active? Or fail? 
        # Safest is to log and proceed or fail. 
        # For now, let's assume if profile missing, they rely on Auth User status.
        return True
