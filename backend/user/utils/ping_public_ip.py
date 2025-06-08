import subprocess

def ping_public_ip(ip_address, count=1, timeout=2):
    try:
        # Linux/Mac: Use '-c' for count, '-W' for timeout (seconds)
        result = subprocess.run(
            ["ping", "-c", str(count), "-W", str(timeout), ip_address],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        return {
            "success": result.returncode == 0,
            "output": result.stdout,
            "error": result.stderr
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }