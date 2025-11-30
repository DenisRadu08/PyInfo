from app.utils import get_password_hash, verify_password

def verify_auth():
    password = "secret_password"
    
    # 1. Test Hashing
    print(f"Hashing password: {password}")
    hashed = get_password_hash(password)
    print(f"Hashed: {hashed}")
    
    # 2. Test Verify Correct
    print("\nVerifying correct password...")
    is_correct = verify_password(password, hashed)
    print(f"Result: {is_correct} (Expected: True)")
    
    # 3. Test Verify Incorrect
    print("\nVerifying incorrect password...")
    is_incorrect = verify_password("wrong_password", hashed)
    print(f"Result: {is_incorrect} (Expected: False)")

if __name__ == "__main__":
    verify_auth()
