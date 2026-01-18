import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock
import sys
import os

# Add backend directory to sys.path so we can import from main, routes, etc.
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app
from middlewares.auth import get_current_user, AuthUser

@pytest.fixture(scope="module")
def test_app():
    client = TestClient(app)
    return client

@pytest.fixture
def mock_supabase(mocker):
    """
    Mock the Supabase client used in routes.
    We'll patch the 'get_supabase_client' utility function.
    """
    mock_client = MagicMock()
    mocker.patch("utils.supabase_client.get_supabase_client", return_value=mock_client)
    return mock_client

@pytest.fixture
def mock_user_auth(mocker):
    """
    Mockito for authentication.
    Overrides the 'get_current_user' dependency.
    """
    mock_user = AuthUser({
        "id": "test-user-id",
        "email": "test@example.com",
        "role": "authenticated",
        "app_metadata": {},
        "user_metadata": {}
    })
    app.dependency_overrides[get_current_user] = lambda: mock_user
    yield mock_user
    app.dependency_overrides = {}

@pytest.fixture
def mock_admin_auth(mocker):
    """
    Mockito for admin authentication.
    """
    mock_user = AuthUser({
        "id": "admin-user-id",
        "email": "admin@example.com",
        "role": "admin",
        "app_metadata": {},
        "user_metadata": {}
    })
    app.dependency_overrides[get_current_user] = lambda: mock_user
    yield mock_user
    app.dependency_overrides = {}
