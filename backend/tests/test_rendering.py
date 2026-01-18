import pytest
from unittest.mock import MagicMock

@pytest.mark.asyncio
async def test_render_endpoint(test_app, mocker):
    # Mock the controller function
    # Note: render_code is async in controller maybe? In routes it is awaited.
    # We patch it where it is imported in the route, or the definition itself.
    # The route imports it from controllers.render_controller
    
    # Since we can't easily mock async functions with just return_value in standard unittest.mock without AsyncMock,
    # and we are using pytest-asyncio, we can use AsyncMock if available or just a coroutine.
    
    # However, if we mock the route handler logic, it's easier. 
    # But integration tests usually call endpoint. 
    
    # Let's mock the controller function to return a dict, and since the route awaits it, 
    # we need the mock to be awaitable.
    
    future = asyncio.Future()
    future.set_result({"success": True, "video_url": "http://vid.url"})
    
    # We need to import asyncio
    import asyncio
    future = asyncio.Future()
    future.set_result({"success": True, "video_url": "http://vid.url"})

    mock_render = mocker.patch("routes.rendering.render_code", return_value=future)

    payload = {"code": "some code", "file_name": "test.py"}
    # Because test_app (TestClient) runs synchronously, it handles async endpoints automatically.
    # But the mock inside must match what the endpoint expects (awaitable).
    
    response = test_app.post("/api/render", json=payload)
    assert response.status_code == 200
    assert response.json()["video_url"] == "http://vid.url"

@pytest.mark.asyncio
async def test_generate_and_render_endpoint(test_app, mocker):
    import asyncio
    future = asyncio.Future()
    future.set_result({
        "success": True, 
        "video_url": "http://gen.url", 
        "sanitized_code": "code",
        "error": None
    })
    
    mock_gen_render = mocker.patch("routes.rendering.generate_and_render", return_value=future)
    
    payload = {"prompt": "make video", "filename": "vid.py"}
    response = test_app.post("/api/generate-and-render", json=payload)
    
    assert response.status_code == 200
    assert response.json()["video_url"] == "http://gen.url"

def test_download_video_found(test_app, mocker, tmp_path):
    # We need to mock os.path.join or create a real file in the expected directory.
    # The route code uses: .. / generated_videos
    # This is relative to the backend/routes file.
    # It resolves to backend/generated_videos.
    
    # Ideally, we mock os.path.exists and FileResponse.
    # But FileResponse reads the file.
    
    # Let's try to actually create a file if possible, or Mock FileResponse entirely.
    # Creating a file is safer/better for integration.
    
    # We need to know where backend is.
    # We are in backend/tests.
    # The app assumes backend/generated_videos exists.
    
    import os
    # Create the directory if it doesn't exist (it should)
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    gen_dir = os.path.join(base_dir, "generated_videos")
    os.makedirs(gen_dir, exist_ok=True)
    
    test_file = os.path.join(gen_dir, "test_vid.mp4")
    with open(test_file, "wb") as f:
        f.write(b"video content")
        
    response = test_app.get("/api/videos/test_vid.mp4")
    assert response.status_code == 200
    assert response.content == b"video content"
    
    # Cleanup
    try:
        os.remove(test_file)
    except:
        pass

def test_download_video_not_found(test_app):
    response = test_app.get("/api/videos/non_existent.mp4")
    assert response.status_code == 404
