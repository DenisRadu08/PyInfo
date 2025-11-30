import requests
import random
import string

base_url = "http://127.0.0.1:8000"

def verify_login():
    # 1. Register a new user
    random_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    email = f"user_{random_str}@example.com"
    password = "securepassword123"
    
    print(f"Registering user: {email}")
    requests.post(f"{base_url}/users", json={"email": email, "password": password})

    # 2. Login with Correct Credentials
    print("\nLogging in with correct credentials...")
    response = requests.post(
        f"{base_url}/token", 
        data={"username": email, "password": password}
    )
    print(f"Login Status: {response.status_code}")
    if response.status_code == 200:
        token_data = response.json()
        print(f"Token Type: {token_data.get('token_type')}")
        print(f"Access Token: {token_data.get('access_token')[:20]}...")
    else:
        print(f"Error: {response.text}")

    # 3. Login with Incorrect Password
    print("\nLogging in with incorrect password...")
    response = requests.post(
        f"{base_url}/token", 
        data={"username": email, "password": "wrongpassword"}
    )
    print(f"Incorrect Login Status: {response.status_code} (Expected 401)")

if __name__ == "__main__":
    verify_login()
