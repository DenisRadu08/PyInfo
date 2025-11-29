import requests

base_url = "http://127.0.0.1:8000"

def verify_delete():
    # 1. Add a dummy test case
    print("Adding dummy test case...")
    test_case = {
        "input_data": "dummy",
        "expected_output": "dummy"
    }
    # Assuming Problem 1 exists
    response = requests.post(f"{base_url}/problems/1/tests", json=test_case)
    if response.status_code != 200:
        print(f"Failed to add test case: {response.text}")
        return
    
    test_id = response.json()["id"]
    print(f"Added test case ID: {test_id}")

    # 2. Delete the test case
    print(f"Deleting test case {test_id}...")
    response = requests.delete(f"{base_url}/tests/{test_id}")
    print(f"Delete Status: {response.status_code}")
    print(f"Response: {response.json()}")

    # 3. Verify deletion (try to delete again)
    print("Verifying deletion...")
    response = requests.delete(f"{base_url}/tests/{test_id}")
    print(f"Second Delete Status: {response.status_code} (Expected 404)")

if __name__ == "__main__":
    verify_delete()
