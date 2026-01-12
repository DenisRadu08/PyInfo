import sys
import subprocess
import time
import os

def execute_code(code: str, input_data: str, timeout: float = 2.0, memory_limit_mb: int = 256) -> dict:
    """
    Executes Python code inside a 'Soft Sandbox' wrapper.
    It blocks dangerous modules (os, subprocess) and functions (open).
    """
    
    # 1. Define Paths (Relative to CWD: /app)
    user_file = "temp_user_code.py"
    wrapper_file = "temp_wrapper.py"

    # 2. Wrapper Content
    # FIX: Citim codul utilizatorului INAINTE sa blocam functia open()
    wrapper_code = f"""
import sys
import resource
import builtins

# --- 0. PREPARE (Read code before locking doors) ---
user_code_content = ""
try:
    with builtins.open("{user_file}", "r", encoding="utf-8") as f:
        user_code_content = f.read()
except Exception as e:
    print(f"System Error: Could not read user code - {{e}}", file=sys.stderr)
    sys.exit(1)

# --- SECURITY LAYER START ---
# 1. Disable File Access
def no_access(*args, **kwargs):
    raise PermissionError("Security Violation: File access is disabled.")

builtins.open = no_access

# 2. Block Dangerous Modules
# We 'poison' the sys.modules cache so imports fail
blacklist = ['os', 'subprocess', 'shutil', 'importlib', 'inspect']

for mod in blacklist:
    sys.modules[mod] = None

# Custom importer to catch new import attempts
original_import = builtins.__import__
def secure_import(name, globals=None, locals=None, fromlist=(), level=0):
    if name in blacklist:
        raise ImportError(f"Security Violation: Module '{{name}}' is banned.")
    return original_import(name, globals, locals, fromlist, level)

builtins.__import__ = secure_import
# --- SECURITY LAYER END ---

# STRICT LIMITS
MEM_LIMIT = {memory_limit_mb} * 1024 * 1024  # {memory_limit_mb} MB

try:
    resource.setrlimit(resource.RLIMIT_AS, (MEM_LIMIT, MEM_LIMIT))
except Exception:
    pass

# EXECUTE USER CODE
try:
    # Run the code we read earlier
    exec(user_code_content, {{'__name__': '__main__'}})

except ImportError as e:
    print(f"Security Error: {{e}}", file=sys.stderr)
    sys.exit(1)
except PermissionError as e:
    print(f"Security Error: {{e}}", file=sys.stderr)
    sys.exit(1)
except MemoryError:
    print("Memory Limit Exceeded", file=sys.stderr)
    sys.exit(137)
except Exception as e:
    print(f"Runtime Error: {{e}}", file=sys.stderr)
    sys.exit(1)
"""

    start_time = time.time()
    
    try:
        # 3. Write Files
        with open(user_file, "w", encoding="utf-8") as f:
            f.write(code)
        
        with open(wrapper_file, "w", encoding="utf-8") as f:
            f.write(wrapper_code)

        # 4. Execute
        cmd = [sys.executable, wrapper_file]
        
        result = subprocess.run(
            cmd,
            input=input_data,
            capture_output=True,
            text=True,
            timeout=timeout
        )
        
        execution_time = time.time() - start_time
        stdout = result.stdout
        stderr = result.stderr
        returncode = result.returncode

        # 5. Parse Results
        
        # Check for Security Violations explicitly
        if "Security Violation" in stderr or "Security Error" in stderr:
             return {
                "status": "Runtime Error",
                "output": stdout,
                "error": "🚫 Security Violation: You are trying to use banned modules or read files.",
                "execution_time": execution_time
            }

        # Check for MLE
        if returncode == 137 or "Memory Limit Exceeded" in stderr:
             return {
                "status": "Memory Limit Exceeded",
                "output": stdout,
                "error": "Memory Limit Exceeded",
                "execution_time": execution_time
            }
        
        # General Runtime Error
        if returncode != 0:
            return {
                "status": "Runtime Error",
                "output": stdout,
                "error": stderr.strip(),
                "execution_time": execution_time
            }

        # Success check
        if stderr.strip():
             return {
                "status": "Runtime Error",
                "output": stdout,
                "error": stderr.strip(),
                "execution_time": execution_time
            }

        return {
            "status": "Accepted",
            "output": stdout,
            "error": stderr,
            "execution_time": execution_time
        }

    except subprocess.TimeoutExpired:
        return {
            "status": "Time Limit Exceeded",
            "output": "",
            "error": "Time Limit Exceeded",
            "execution_time": timeout
        }
    except Exception as e:
        return {
            "status": "Runtime Error",
            "output": "",
            "error": str(e),
            "execution_time": time.time() - start_time
        }
    finally:
        # Cleanup
        try:
            if os.path.exists(user_file):
                os.remove(user_file)
            if os.path.exists(wrapper_file):
                os.remove(wrapper_file)
        except:
            pass