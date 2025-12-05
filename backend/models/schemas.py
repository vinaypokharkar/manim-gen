from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class PromptIn(BaseModel):
    prompt: str

class GenerateResponse(BaseModel):
    path: str
    code: str
    metadata: dict

class ValidationRequest(BaseModel):
    code: str

class ValidationResponse(BaseModel):
    ok: bool
    errors: List[str] | None = None
    sanitized_code: str | None = None

class CodeRequest(BaseModel):
    filename: str = "script.py"
    code: str
    scene_class: str = "GeneratedScene"
    quality: str = "low"

class CombinedGenerateRenderRequest(BaseModel):
    prompt: str
    scene_class: str = "GeneratedScene"
    quality: str = "low"
    filename: str = "script.py"
    max_retries: int = 2

class CombinedGenerateRenderResponse(BaseModel):
    success: bool
    filename: Optional[str] = None
    local_path: Optional[str] = None
    supabase_url: Optional[str] = None
    code: Optional[str] = None
    sanitized_code: Optional[str] = None
    error: Optional[str] = None
    logs: Optional[Dict[str, Any]] = None

class UserSignup(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    user: Dict[str, Any]

class ChatBase(BaseModel):
    title: str

class ChatOut(ChatBase):
    id: str
    created_at: str
    updated_at: str

class MessageBase(BaseModel):
    role: str
    content: str

class MessageOut(MessageBase):
    id: str
    created_at: str

class VideoOut(BaseModel):
    id: str
    video_url: str | None
    code: str | None
    created_at: str

class ChatWithMessages(ChatOut):
    messages: List[MessageOut] = []

class CreateChatRequest(BaseModel):
    title: Optional[str] = "New Chat"
    initial_prompt: Optional[str] = None


