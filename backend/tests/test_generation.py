from unittest.mock import MagicMock

def test_generate_endpoint(test_app, mocker):
    # Mock the controller function
    mock_generate = mocker.patch("routes.generation.generate_manim_code")
    mock_generate.return_value = {
        "path": "test_path.py",
        "code": "print('hello')",
        "metadata": {"some": "data"}
    }
    
    payload = {"prompt": "Create a blue circle"}
    response = test_app.post("/api/generate", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    assert data["path"] == "test_path.py"
    assert data["code"] == "print('hello')"
    mock_generate.assert_called_once_with("Create a blue circle")

def test_generate_endpoint_error(test_app, mocker):
    mock_generate = mocker.patch("routes.generation.generate_manim_code")
    mock_generate.side_effect = Exception("Generation failed")
    
    payload = {"prompt": "Boom"}
    response = test_app.post("/api/generate", json=payload)
    
    assert response.status_code == 500
    assert response.json()["detail"] == "Generation failed"
