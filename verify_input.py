import requests
import random
import string

base_url = "http://127.0.0.1:8000"

def verify_run_input():
    # 1. Login
    random_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    email = f"tester_{random_str}@example.com"
    password = "password"
    
    requests.post(f"{base_url}/users", json={"email": email, "password": password})
    login_res = requests.post(f"{base_url}/token", data={"username": email, "password": password})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Run Code with Input
    print("Testing /run with input()...")
    code = "name = input()\nprint(f'Hello, {name}!')"
    input_str = "World"
    
    res = requests.post(
        f"{base_url}/run",
        json={"code": code, "input_data": input_str},
        headers=headers
    )
    
    print(f"Status: {res.status_code}")
    data = res.json()
    print(f"Response: {data}")
    
    expected_output = "Hello, World!\n"
    if data.get("output") == expected_output:
        print("SUCCESS: Input was correctly passed to code.")
    else:
        print(f"FAILURE: Expected '{expected_output}', got '{data.get('output')}'")

if __name__ == "__main__":
    verify_run_input()
