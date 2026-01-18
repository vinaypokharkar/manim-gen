def test_root_endpoint(test_app):
    response = test_app.get("/")
    assert response.status_code == 200
    assert response.json() == {"msg": "ok"}

def test_debug_supabase_endpoint(test_app, mock_supabase):
    # Determine the expected response based on the actual implementation of logic
    # In main.py, it reads os.getenv directly, not using the mock client's properties for URL/Key
    # But it tries to create a client.
    
    # We can mock os.getenv to ensure consistent results if we want to test "NOT SET" or real values
    # For now, we just check structure
    response = test_app.get("/debug/supabase")
    assert response.status_code == 200
    data = response.json()
    assert "supabase_url" in data
    assert "client_initialized" in data
