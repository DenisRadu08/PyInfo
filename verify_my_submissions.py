import requests
import random
import string

base_url = "http://127.0.0.1:8000"

def verify_my_submissions():
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

    # 2. Submit a Solution (to generate a submission)
    # Assuming problem 1 exists
    print("Submitting solution...")
    code = "print('Hello')"
    requests.post(
        f"{base_url}/submit/1", 
        json={"code": code},
        headers=headers
    )

    # 3. Fetch My Submissions
    print("Fetching my submissions...")
    my_subs_res = requests.get(f"{base_url}/my-submissions", headers=headers)
    
    if my_subs_res.status_code == 200:
        submissions = my_subs_res.json()
        print(f"Found {len(submissions)} submissions.")
        if len(submissions) > 0:
            print(f"First submission status: {submissions[0]['status']}")
            print("SUCCESS: Retrieved submissions.")
        else:
            print("FAILURE: No submissions found.")
    else:
        print(f"FAILURE: Failed to fetch submissions. Status: {my_subs_res.status_code}")
        print(my_subs_res.text)

if __name__ == "__main__":
    verify_my_submissions()
