import requests
import random
import string

base_url = "http://127.0.0.1:8000"

def verify_registration():
    # Generate random email to avoid conflicts
    random_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    email = f"user_{random_str}@example.com"
    password = "securepassword123"

    print(f"Attempting to register user: {email}")
    
    # 1. Register New User
    response = requests.post(f"{base_url}/users", json={"email": email, "password": password})
    print(f"Registration Status: {response.status_code}")
    if response.status_code == 200:
        user = response.json()
        print(f"Registered User ID: {user['id']}")
        print(f"Registered User Email: {user['email']}")
        if "hashed_password" in user:
            print("ERROR: Hashed password returned in response!")
        else:
            print("SUCCESS: Password not exposed.")
    else:
        print(f"Error: {response.text}")
        return

    # 2. Duplicate Registration
    print("\nAttempting duplicate registration...")
    response = requests.post(f"{base_url}/users", json={"email": email, "password": "anotherpassword"})
    print(f"Duplicate Status: {response.status_code} (Expected 400)")
    if response.status_code == 400:
        print("SUCCESS: Duplicate registration rejected.")
    else:
        print(f"FAILURE: Unexpected status code {response.status_code}")

if __name__ == "__main__":
    verify_registration()
