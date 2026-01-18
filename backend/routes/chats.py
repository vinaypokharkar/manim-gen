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
    chat_res = supabase.table("chats").insert(chat_data).execute()
    chat = chat_res.data[0]
    
    # 2. If initial prompt provided, trigger flow
    if req.initial_prompt:
        # We can run this in background or await it. Awaiting it makes the UI wait for generation (slow).
        # But usually Create Chat returns the Chat object fast.
        # For simplicity in this user request "displaying ... chats and history", we might want to just start it.
        # However, if we want to return the populated chat, we must await.
        # Let's await to keep it simple and consistent.
        await process_user_message(chat["id"], req.initial_prompt, user)
        # Fetch fresh chat data to return updated timestamps if needed, 
        # but the chat object "id" and "title" are enough for the list.
        
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

async def process_user_message(chat_id: str, prompt: str, user: AuthUser):
    supabase = get_supabase_client()
    
    # 1. Update Chat's updated_at timestamp
    # This ensures the chat moves to the top of the list
    from datetime import datetime, timezone
    now_iso = datetime.now(timezone.utc).isoformat()
    supabase.table("chats").update({"updated_at": now_iso}).eq("id", chat_id).execute()

    # 2. Save User Message
    user_msg_data = {
        "chat_id": chat_id,
        "role": "user",
        "content": prompt
    }
    # Ideally add user_id to messages if the schema supports it for RLS
    # user_msg_data["user_id"] = user.id 
    
    supabase.table("messages").insert(user_msg_data).execute()
    
    # 3. Generate Logic
    try:
        render_req = CombinedGenerateRenderRequest(
            prompt=prompt,
            filename=f"chat_{chat_id}_step.py",
            max_retries=2
        )
        
        # Call the heavy lifter
        result = await generate_and_render(render_req)
        
        # result is a dict
        is_success = result.get("success", False)
        sanitized_code = result.get("sanitized_code")
        error_msg_val = result.get("error")
        supabase_url = result.get("supabase_url")

        # 4. Construct Assistant Response
        assistant_content = ""
        
        if is_success:
            assistant_content = f"Here is the generated video for: {prompt}"
            if sanitized_code:
                 assistant_content += f"\n\nCode used:\n```python\n{sanitized_code}\n```"
        else:
            assistant_content = f"I failed to generate the video. Error: {error_msg_val}"
            if sanitized_code:
                 assistant_content += f"\n\nI tried running:\n```python\n{sanitized_code}\n```"

        # Save Assistant Message
        asst_msg_data = {
            "chat_id": chat_id,
            "role": "assistant",
            "content": assistant_content
        }
        asst_msg_res = supabase.table("messages").insert(asst_msg_data).execute()
        asst_msg = asst_msg_res.data[0]
        
        # 5. If success, Save Video Record linked to this message
        if is_success and supabase_url:
            video_data = {
                "chat_id": chat_id,
                "message_id": asst_msg["id"],
                "user_id": user.id,
                "prompt": prompt,
                "code": sanitized_code,
                "video_url": supabase_url
            }
            supabase.table("generated_videos").insert(video_data).execute()
            
        return {
            "message": asst_msg,
            "video_url": supabase_url if is_success else None
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


@router.post("/{chat_id}/message")
async def send_message(chat_id: str, req: PromptIn, user: AuthUser = Depends(get_current_user)):
    """
    User sends a prompt. 
    1. Saves message. 2. Generates video. 3. Saves response.
    Verifies ownership.
    """
    supabase = get_supabase_client()
    
    # Verify chat ownership first
    chat_res = supabase.table("chats").select("id").eq("id", chat_id).eq("user_id", user.id).single().execute()
    if not chat_res.data:
         raise HTTPException(status_code=404, detail="Chat not found")

    return await process_user_message(chat_id, req.prompt, user)
