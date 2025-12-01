import requests
import random
import string

base_url = "http://127.0.0.1:8000"

def verify_admin_role():
    # 1. Register Admin User
    random_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    email = f"admin_{random_str}@example.com"
    password = "securepassword123"
    
    print(f"Registering admin user: {email}")
    requests.post(f"{base_url}/users", json={"email": email, "password": password, "is_admin": True})
    
    print("Logging in...")
    login_res = requests.post(f"{base_url}/token", data={"username": email, "password": password})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Check /users/me
    print("Checking /users/me...")
    me_res = requests.get(f"{base_url}/users/me", headers=headers)
    
    if me_res.status_code == 200:
        user_data = me_res.json()
        print(f"User data: {user_data}")
        if user_data.get("is_admin") is True:
            print("SUCCESS: User is admin.")
        else:
            print("FAILURE: User is NOT admin.")
    else:
        print(f"FAILURE: Failed to fetch user data. Status: {me_res.status_code}")
        print(me_res.text)

if __name__ == "__main__":
    verify_admin_role()
