import requests
import random
import string

base_url = "http://127.0.0.1:8000"

def verify_submission_storage():
    # 1. Register and Login
    random_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    email = f"user_{random_str}@example.com"
    password = "securepassword123"
    
    print(f"Registering user: {email}")
    requests.post(f"{base_url}/users", json={"email": email, "password": password})
    
    print("Logging in...")
    login_res = requests.post(f"{base_url}/token", data={"username": email, "password": password})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create a Problem (if needed, but we likely have one from previous steps)
    # Let's assume problem 1 exists or create it
    problem_res = requests.get(f"{base_url}/problems/1")
    if problem_res.status_code == 404:
        print("Creating dummy problem...")
        requests.post(f"{base_url}/problems", json={
            "title": "Sum Two Numbers",
            "description": "Return the sum of a and b",
            "difficulty": "Easy"
        })

    # 3. Submit Solution
    print("Submitting solution...")
    code = "print(sum(map(int, input().split())))" # Simple sum solution
    submit_res = requests.post(
        f"{base_url}/submit/1", 
        json={"code": code},
        headers=headers
    )
    
    if submit_res.status_code == 200:
        results = submit_res.json()
        if results and "submission_id" in results[0]:
            print(f"SUCCESS: Submission saved with ID: {results[0]['submission_id']}")
        else:
            print("FAILURE: Submission ID not found in response.")
            print(results)
    else:
        print(f"FAILURE: Submission failed with status {submit_res.status_code}")
        print(submit_res.text)

if __name__ == "__main__":
    verify_submission_storage()
