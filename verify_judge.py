import requests
import random
import string
import json

base_url = "http://127.0.0.1:8000"

def verify_judge():
    try:
        # 1. Register and Login
        random_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
        email = f"judge_{random_str}@example.com"
        password = "securepassword123"
        
        print(f"Registering user: {email}")
        reg_res = requests.post(f"{base_url}/users", json={"email": email, "password": password})
        print(f"Registration Status: {reg_res.status_code}")
        
        print("Logging in...")
        login_res = requests.post(f"{base_url}/token", data={"username": email, "password": password})
        if login_res.status_code != 200:
            print(f"Login failed: {login_res.text}")
            return
            
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Create a Problem
        print("Creating test problem...")
        prob_res = requests.post(f"{base_url}/problems", json={
            "title": "Judge Test Problem",
            "description": "Output input",
            "difficulty": "Easy"
        }, headers=headers)
        
        print(f"Create Problem Status: {prob_res.status_code}")
        if prob_res.status_code != 200:
            print(f"Response: {prob_res.text}")
            return

        problem_data = prob_res.json()
        problem_id = problem_data.get("id")
        if not problem_id:
            print(f"Failed to get problem ID from: {problem_data}")
            return
        print(f"Problem created with ID: {problem_id}")

        # 3. Add Test Case
        print("Adding test case...")
        test_res = requests.post(f"{base_url}/problems/{problem_id}/tests", json={
            "input_data": "10",
            "expected_output": "10"
        }, headers=headers)
        
        if test_res.status_code != 200:
            print(f"Failed to add test case: {test_res.text}")
            return
        print("Test case added.")

        # 4. Submit CORRECT Solution
        print("\nTest 1: Correct Solution")
        code_correct = "print(input())"
        submit_res = requests.post(
            f"{base_url}/submit/{problem_id}", 
            json={"code": code_correct},
            headers=headers
        )
        print(f"Status: {submit_res.status_code}")
        try:
            data = submit_res.json()
            print(f"Response: {data}")
            if data.get("status") == "Accepted":
                print("SUCCESS: Correct code accepted.")
            else:
                print("FAILURE: Correct code NOT accepted.")
        except:
            print(f"Failed to parse JSON response: {submit_res.text}")

        # 6. Submit Incorrect Code
        print("Submitting incorrect code...")
        incorrect_code = "print(999)" # Wrong answer
        submit_res = requests.post(
            f"{base_url}/submit", # Update endpoint
            json={"code": incorrect_code, "problem_id": problem_id}, # Update payload
            headers=headers
        )
        print(f"Submit Status: {submit_res.status_code}")
        print(f"Submit Response: {submit_res.text}")
        
        try:
            submit_data = submit_res.json()
            if submit_data.get("status") == "Wrong Answer":
                print("SUCCESS: Incorrect code rejected.")
            else:
                print("FAILURE: Incorrect code NOT rejected properly.")
        except:
            print(f"Failed to parse JSON response: {submit_res.text}")
                
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    verify_judge()
