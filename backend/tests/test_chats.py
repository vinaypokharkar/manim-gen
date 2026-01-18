from unittest.mock import MagicMock
import pytest

def test_list_chats(test_app, mock_user_auth, mock_supabase):
    # Mock database response
    expected_data = [
        {"id": "chat-1", "user_id": "test-user-id", "title": "Chat 1", "created_at": "2023-01-01T00:00:00Z"},
        {"id": "chat-2", "user_id": "test-user-id", "title": "Chat 2", "created_at": "2023-01-02T00:00:00Z"}
    ]
    
    # Chain mocks: supabase.table().select().eq().order().execute()
    mock_select = mock_supabase.table.return_value.select.return_value
    mock_eq = mock_select.eq.return_value
    mock_order = mock_eq.order.return_value
    mock_order.execute.return_value.data = expected_data

    response = test_app.get("/api/chats/")
    assert response.status_code == 200
    assert len(response.json()) == 2
    assert response.json()[0]["id"] == "chat-1"

def test_create_chat_no_initial_prompt(test_app, mock_user_auth, mock_supabase):
    # Mock creation
    mock_insert = mock_supabase.table.return_value.insert.return_value
    mock_insert.execute.return_value.data = [
        {"id": "new-chat", "user_id": "test-user-id", "title": "My New Chat", "created_at": "now"}
    ]

    payload = {"title": "My New Chat"}
    response = test_app.post("/api/chats/", json=payload)
    
    assert response.status_code == 200
    assert response.json()["title"] == "My New Chat"

@pytest.mark.asyncio
async def test_get_chat_details_found(test_app, mock_user_auth, mock_supabase):
    chat_id = "chat-123"
    
    # Mock chat fetch
    mock_chat_query = mock_supabase.table.return_value.select.return_value.eq.return_value.eq.return_value.single.return_value
    mock_chat_query.execute.return_value.data = {"id": chat_id, "title": "Found Chat"}
    
    # Mock messages fetch
    mock_msgs_query = mock_supabase.table.return_value.select.return_value.eq.return_value.order.return_value
    mock_msgs_query.execute.return_value.data = [
        {"id": "msg-1", "content": "hello", "role": "user"},
        {"id": "msg-2", "content": "hi", "role": "assistant"}
    ]

    response = test_app.get(f"/api/chats/{chat_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == chat_id
    assert len(data["messages"]) == 2

def test_get_chat_details_not_found(test_app, mock_user_auth, mock_supabase):
    chat_id = "missing-chat"
    
    # Mock chat fetch returning None
    mock_chat_query = mock_supabase.table.return_value.select.return_value.eq.return_value.eq.return_value.single.return_value
    mock_chat_query.execute.return_value.data = None

    response = test_app.get(f"/api/chats/{chat_id}")
    assert response.status_code == 404
