from unittest.mock import MagicMock

def test_signup_success(test_app, mock_supabase):
    # Mock supabase.auth.sign_up
    mock_response = MagicMock()
    mock_response.user.id = "new-user-id"
    mock_response.user.email = "new@example.com"
    mock_response.session.access_token = "fake-access-token"
    mock_response.session.refresh_token = "fake-refresh-token"
    
    mock_supabase.auth.sign_up.return_value = mock_response

    payload = {
        "email": "new@example.com",
        "password": "password123",
        "full_name": "New User"
    }
    response = test_app.post("/api/auth/signup", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["access_token"] == "fake-access-token"
    assert data["user"]["email"] == "new@example.com"

def test_login_success(test_app, mock_supabase):
    # Mock supabase.auth.sign_in_with_password
    mock_response = MagicMock()
    mock_response.user.id = "user-id"
    mock_response.user.email = "test@example.com"
    mock_response.session.access_token = "valid-token"
    mock_response.session.refresh_token = "valid-refresh"
    
    mock_supabase.auth.sign_in_with_password.return_value = mock_response

    payload = {
        "email": "test@example.com",
        "password": "password123"
    }
    response = test_app.post("/api/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["access_token"] == "valid-token"

def test_google_login_url(test_app, mock_supabase):
    # Mock supabase.auth.sign_in_with_oauth
    mock_res = MagicMock()
    mock_res.url = "https://accounts.google.com/o/oauth2/auth..."
    mock_supabase.auth.sign_in_with_oauth.return_value = mock_res
    
    response = test_app.get("/api/auth/google")
    assert response.status_code == 200
    assert response.json()["url"] == "https://accounts.google.com/o/oauth2/auth..."
