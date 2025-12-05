import asyncio
from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from uuid import UUID

from middlewares.auth import AuthUser, get_current_user
from utils.supabase_client import get_supabase_client
from models.schemas import ChatOut, MessageOut, ChatWithMessages, CreateChatRequest, PromptIn
from controllers.render_controller import generate_and_render
from models.schemas import CombinedGenerateRenderRequest

# Import controller logic directly if needed, or use service layer.
# Reusing generation logic from render_controller for now.

router = APIRouter()

@router.get("/", response_model=List[ChatOut])
async def list_chats(user: AuthUser = Depends(get_current_user)):
    supabase = get_supabase_client()
    res = supabase.table("chats").select("*").eq("user_id", user.id).order("updated_at", desc=True).execute()
    return res.data

@router.post("/", response_model=ChatOut)
async def create_chat(req: CreateChatRequest, user: AuthUser = Depends(get_current_user)):
    supabase = get_supabase_client()
    
    # 1. Create Chat
    chat_data = {
        "user_id": user.id,
        "title": req.title or "New Chat"
    }
    chat_res = supabase.table("chats").insert(chat_data).select().single().execute()
    chat = chat_res.data
    
    # 2. If initial prompt provided, we can trigger the flow (optional, for now just create chat)
    if req.initial_prompt:
        # TODO: Trigger initial message creation logic?
        pass
        
    return chat

@router.get("/{chat_id}", response_model=ChatWithMessages)
async def get_chat(chat_id: str, user: AuthUser = Depends(get_current_user)):
    supabase = get_supabase_client()
    
    # Verify ownership handled by RLS, but we need to check existence
    chat_res = supabase.table("chats").select("*").eq("id", chat_id).eq("user_id", user.id).single().execute()
    if not chat_res.data:
        raise HTTPException(status_code=404, detail="Chat not found")
        
    msgs_res = supabase.table("messages").select("*").eq("chat_id", chat_id).order("created_at").execute()
    
    return {
        **chat_res.data,
        "messages": msgs_res.data
    }

@router.post("/{chat_id}/message")
async def send_message(chat_id: str, req: PromptIn, user: AuthUser = Depends(get_current_user)):
    """
    User sends a prompt. 
    1. Save User Message.
    2. Generate & Render Video (this effectively is the Assistant's work).
    3. Save Assistant Message + Video Link.
    """
    supabase = get_supabase_client()
    
    # Verify chat ownership first
    chat_res = supabase.table("chats").select("id").eq("id", chat_id).eq("user_id", user.id).single().execute()
    if not chat_res.data:
         raise HTTPException(status_code=404, detail="Chat not found")

    # 1. Save User Message
    user_msg_data = {
        "chat_id": chat_id,
        "role": "user",
        "content": req.prompt
    }
    supabase.table("messages").insert(user_msg_data).execute()
    
    # 2. Generate Logic (Invoke existing controller)
    # This involves calling LLM -> Generating Code -> Rendering Video
    try:
        render_req = CombinedGenerateRenderRequest(
            prompt=req.prompt,
            filename=f"chat_{chat_id}_step.py", # Temporary filename mostly
            max_retries=2
        )
        
        # Call the heavy lifter
        result = await generate_and_render(render_req)
        
        # 3. Construct Assistant Response
        assistant_content = ""
        video_record = None
        
        if result.success:
            assistant_content = f"Here is the generated video for: {req.prompt}"
            if result.sanitized_code:
                 assistant_content += f"\n\nCode used:\n```python\n{result.sanitized_code}\n```"
        else:
            assistant_content = f"I failed to generate the video. Error: {result.error}"
            if result.sanitized_code:
                 assistant_content += f"\n\nI tried running:\n```python\n{result.sanitized_code}\n```"

        # Save Assistant Message
        asst_msg_data = {
            "chat_id": chat_id,
            "role": "assistant",
            "content": assistant_content
        }
        asst_msg_res = supabase.table("messages").insert(asst_msg_data).select().single().execute()
        asst_msg = asst_msg_res.data
        
        # 4. If success, Save Video Record linked to this message
        if result.success and result.supabase_url:
            video_data = {
                "chat_id": chat_id,
                "message_id": asst_msg["id"],
                "user_id": user.id,
                "prompt": req.prompt,
                "code": result.sanitized_code,
                "video_url": result.supabase_url
            }
            supabase.table("generated_videos").insert(video_data).execute()
            
        return {
            "message": asst_msg,
            "video_url": result.supabase_url if result.success else None
        }

    except Exception as e:
        # If generation fails hard
        err_msg = {
            "chat_id": chat_id, 
            "role": "assistant", 
            "content": f"System Error: {str(e)}"
        }
        supabase.table("messages").insert(err_msg).execute()
        raise HTTPException(status_code=500, detail=str(e))
