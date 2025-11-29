import requests

base_url = "http://127.0.0.1:8000"

def verify_grading():
    # 1. Create a test case for Problem 1 (Sum of numbers)
    # Assuming Problem 1 exists and asks for sum of two numbers input as "a b"
    print("Adding test case...")
    test_case = {
        "input_data": "3 5",
        "expected_output": "8"
    }
    response = requests.post(f"{base_url}/problems/1/tests", json=test_case)
    print(f"Add Test Case Status: {response.status_code}")
    if response.status_code != 200:
        print(response.text)
        return

    # 2. Submit Correct Solution
    print("\nSubmitting Correct Solution...")
    correct_code = """
import sys
data = sys.stdin.read().split()
if data:
    a = int(data[0])
    b = int(data[1])
    print(a + b)
"""
    response = requests.post(f"{base_url}/submit/1", json={"code": correct_code})
    print(f"Status: {response.status_code}")
    results = response.json()
    print("Results:", results)

    # 3. Submit Incorrect Solution
    print("\nSubmitting Incorrect Solution...")
    incorrect_code = "print(0)"
    response = requests.post(f"{base_url}/submit/1", json={"code": incorrect_code})
    print(f"Status: {response.status_code}")
    results = response.json()
    print("Results:", results)

if __name__ == "__main__":
    verify_grading()
