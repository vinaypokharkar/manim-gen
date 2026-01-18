from unittest.mock import MagicMock

def test_validate_endpoint_valid(test_app, mocker):
    mock_validate = mocker.patch("routes.validation.sanitize_and_validate")
    mock_validate.return_value = {"ok": True, "sanitized_code": "clean code"}
    
    payload = {"code": "dirty code"}
    response = test_app.post("/api/validate", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    assert data["ok"] is True
    assert data["sanitized_code"] == "clean code"

def test_validate_endpoint_invalid(test_app, mocker):
    mock_validate = mocker.patch("routes.validation.sanitize_and_validate")
    mock_validate.return_value = {"ok": False, "errors": ["Syntax error"], "sanitized_code": "bad code"}
    
    payload = {"code": "bad code"}
    response = test_app.post("/api/validate", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    assert data["ok"] is False
    assert "Syntax error" in data["errors"]
