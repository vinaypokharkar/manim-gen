from fastapi import APIRouter, HTTPException, status
from models.schemas import UserSignup, UserLogin, AuthResponse
from utils.supabase_client import get_supabase_client

router = APIRouter()

@router.post("/signup")
async def signup(user: UserSignup):
    supabase = get_supabase_client()
    try:
        options = {}
        if user.full_name:
            options["data"] = {"full_name": user.full_name}
        
        response = supabase.auth.sign_up({
            "email": user.email, 
            "password": user.password, 
            "options": options
        })
        
        # If email confirmation is enabled, session might be None
        if response.user and not response.session:
            return {"message": "User created. Please check your email to confirm."}
            
        if not response.user or not response.session:
            raise HTTPException(status_code=400, detail="Signup failed")
            
        return {
            "access_token": response.session.access_token,
            "refresh_token": response.session.refresh_token,
            "user": {
                "id": response.user.id,
                "email": response.user.email,
                "metadata": response.user.user_metadata,
                "created_at": response.user.created_at
            }
        }
    except Exception as e:
        # Crude error handling, usually Supabase returns structured errors
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login", response_model=AuthResponse)
async def login(user: UserLogin):
    supabase = get_supabase_client()
    try:
        response = supabase.auth.sign_in_with_password({
            "email": user.email, 
            "password": user.password
        })
        
        if not response.session:
             raise HTTPException(status_code=400, detail="Login failed")
             
        return {
            "access_token": response.session.access_token,
            "refresh_token": response.session.refresh_token,
            "user": {
                "id": response.user.id,
                "email": response.user.email,
                "metadata": response.user.user_metadata,
                "created_at": response.user.created_at
            }
        }
    except Exception as e:
         raise HTTPException(status_code=400, detail=str(e))

@router.get("/google")
async def google_login():
    """
    Returns the URL to start the Google OAuth flow.
    The frontend should redirect the user to this URL.
    """
    supabase = get_supabase_client()
    try:
        # Get the current URL for redirection (assuming localhost for dev)
        # In production, this should be your frontend URL
        # We can read this from env if needed
        import os
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        redirect_url = f"{frontend_url}/auth/callback"
        
        data = supabase.auth.sign_in_with_oauth({
            "provider": "google",
            "options": {
                "redirect_to": redirect_url,
                "queryParams": {
                    "access_type": "offline",
                    "prompt": "consent"
                }
            }
        })
        return {"url": data.url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/callback", response_model=AuthResponse)
async def auth_callback(payload: dict):
    """
    Exchanges the auth code for a session.
    Expects JSON body: {"code": "..."}
    """
    supabase = get_supabase_client()
    code = payload.get("code")
    if not code:
        raise HTTPException(status_code=400, detail="Code is required")
        
    try:
        # Exchange code for session
        response = supabase.auth.exchange_code_for_session({"auth_code": code})
        
        if not response.session:
            raise HTTPException(status_code=400, detail="Failed to exchange code for session")
            
        return {
            "access_token": response.session.access_token,
            "refresh_token": response.session.refresh_token,
            "user": {
                "id": response.user.id,
                "email": response.user.email,
                "metadata": response.user.user_metadata,
                "created_at": response.user.created_at
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
