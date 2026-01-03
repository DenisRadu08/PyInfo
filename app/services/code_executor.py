import sys
import subprocess
import time
import os

def execute_code(code: str, input_data: str, timeout: float = 2.0, memory_limit_mb: int = 256) -> dict:
    """
    Executes Python code using a fixed wrapper script approach for strict memory enforcement.
    Rewritten to use explicit file paths and internal limit setting logic.
    """
    
    # 1. Define Paths (Relative to CWD: /app)
    user_file = "temp_user_code.py"
    wrapper_file = "temp_wrapper.py"

    # 2. Wrapper Content
    # We use strict limits logic injected into the wrapper
    # Added RLIMIT_DATA as backup to RLIMIT_AS
    wrapper_code = f"""
import sys
import resource
import subprocess
import os

# STRICT LIMITS
MEM_LIMIT = {memory_limit_mb} * 1024 * 1024  # {memory_limit_mb} MB

# Silent during normal operation to avoid polluting stderr

try:
    resource.setrlimit(resource.RLIMIT_AS, (MEM_LIMIT, MEM_LIMIT))
    try:
        resource.setrlimit(resource.RLIMIT_DATA, (MEM_LIMIT, MEM_LIMIT))
    except:
        pass
except Exception:
    # Fail silently on resource setting to avoid false positive runtime errors
    pass

# EXECUTE USER CODE
try:
    # We read and exec to stay in the same process with limits applied
    with open("{user_file}", "r", encoding="utf-8") as f:
        code = f.read()
    exec(code, {{'__name__': '__main__'}})
except MemoryError:
    # This is the ONLY time we want to print to stderr for control flow
    print("Memory Limit Exceeded", file=sys.stderr)
    sys.exit(137) # Simulate OOM via exit code
except Exception as e:
    # Print runtime errors normally
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
        # Using sys.executable to ensure the correct python env
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
        
        # Check for MLE (Exit 137 or MemoryError in logs)
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
                "error": stderr.strip(), # Clean whitespace
                "execution_time": execution_time
            }

        # Success - Strict check: stderr should be empty for "Accepted"
        if stderr.strip():
             # If wrapper was silent, this might be a runtime warning or error from user code
             return {
                "status": "Runtime Error",
                "output": stdout,
                "error": stderr.strip(),
                "execution_time": execution_time
            }

        # Success
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
