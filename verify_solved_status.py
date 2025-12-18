import requests
import random
import string

base_url = "http://127.0.0.1:8000"

def verify_solved():
    # 1. Login/Register
    random_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    email = f"solved_tester_{random_str}@example.com"
    password = "password"
    
    requests.post(f"{base_url}/users", json={"email": email, "password": password})
    login_res = requests.post(f"{base_url}/token", data={"username": email, "password": password})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create a specific problem for testing
    print("Creating test problem...")
    problem_data = {
        "title": f"Solved Check {random_str}",
        "description": "Echo input",
        "difficulty": "Easy"
    }
    prob_res = requests.post(f"{base_url}/problems", json=problem_data)
    if prob_res.status_code != 200:
        print(f"Failed to create problem: {prob_res.text}")
        return
    problem_id = prob_res.json()["id"]
    print(f"Created Problem ID: {problem_id}")

    # Add Test Case
    requests.post(f"{base_url}/problems/{problem_id}/tests", json={
        "input_data": "test_input",
        "expected_output": "test_input"
    })

    # 3. Check Status (Should be False)
    res_before = requests.get(f"{base_url}/problems", headers=headers)
    p_before = next((p for p in res_before.json() if p['id'] == problem_id), None)
    if p_before:
        print(f"Before Submission - is_solved: {p_before.get('is_solved')}")
    else:
        print("Problem not found in list!")

    # 4. Submit Correct Solution
    print("Submitting correct solution...")
    code = "print(input())" 
    submit_res = requests.post(
        f"{base_url}/submit",
        json={"code": code, "problem_id": problem_id},
        headers=headers
    )
    print(f"Submit Status: {submit_res.status_code}, {submit_res.text}")

    # 5. Check Status (Should be True)
    res_after = requests.get(f"{base_url}/problems", headers=headers)
    p_after = next((p for p in res_after.json() if p['id'] == problem_id), None)
    if p_after:
        print(f"After Submission - is_solved: {p_after.get('is_solved')}")
        if p_after.get('is_solved') is True:
            print("SUCCESS: Problem marked as solved!")
        else:
            print("FAILURE: Problem NOT marked as solved.")
    else:
        print("Problem not found in list after submission!")

if __name__ == "__main__":
    verify_solved()
