import pytest
from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_404_error(client):
    response = client.get('/nonexistent-page')
    assert response.status_code == 404
    assert b"Not Found" in response.data

def test_submit_application_success(client):
    data = {
        "name_first": "John",
        "name_last": "Doe",
        "email_address": "john@example.com",
        "phone_number": "1234567890",
        "document_ssn": "123456789",
        "birth_date": "1990-01-01",
        "address_line_1": "123 Main St",
        "address_city": "Anytown",
        "address_state": "NY",
        "address_postal_code": "12345",
        "address_country_code": "US"
    }
    response = client.post('/submit', json=data)
    assert response.status_code == 200
    assert 'outcome' in response.json
