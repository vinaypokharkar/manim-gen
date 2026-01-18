def test_me_endpoint(test_app, mock_user_auth):
    response = test_app.get("/api/me")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "test-user-id"
    assert data["role"] == "authenticated"

def test_admin_only_endpoint_forbidden(test_app, mock_user_auth):
    # mock_user_auth is a regular user
    response = test_app.get("/api/admin-only")
    assert response.status_code == 403

def test_admin_only_endpoint_success(test_app, mock_admin_auth):
    # mock_admin_auth is an admin
    response = test_app.get("/api/admin-only")
    assert response.status_code == 200
    assert response.json()["message"] == "Welcome admin"
