import requests

url = "http://127.0.0.1:8000/run"

def test_code(code, description):
    print(f"Testing: {description}")
    try:
        response = requests.post(url, json={"code": code})
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")
    print("-" * 20)

# 1. Valid Code
test_code("print('Hello from API')", "Valid Code")

# 2. Syntax Error
test_code("print('Missing parenthesis", "Syntax Error")

# 3. Infinite Loop (Timeout)
test_code("while True: pass", "Infinite Loop")
