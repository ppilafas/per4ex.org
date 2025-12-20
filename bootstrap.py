#!/usr/bin/env python3
import socket
import subprocess
import os
import signal
import sys
import time
from pathlib import Path

def find_free_port(start_port):
    """Find the first available port starting from start_port."""
    port = start_port
    while True:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex(('localhost', port)) != 0:
                return port
            port += 1

def main():
    root_dir = Path(__file__).parent.absolute()
    
    # 1. Configuration
    print("🔍 Scanning for available ports...")
    
    # Find free ports
    api_port = find_free_port(8000)
    # Start web port search from 3000, but ensure it doesn't clash with api_port
    web_port = find_free_port(3000)
    if web_port == api_port:
        web_port = find_free_port(web_port + 1)
        
    print(f"✅ Ports assigned:")
    print(f"   ➜ API: http://localhost:{api_port}")
    print(f"   ➜ Web: http://localhost:{web_port}")
    
    # 2. Python Environment Check
    api_dir = root_dir / "apps" / "api"
    venv_python = api_dir / ".venv" / "bin" / "python"
    
    if venv_python.exists():
        print(f"🐍 Using virtual environment: {venv_python}")
        python_cmd = str(venv_python)
    else:
        print("⚠️  No .venv found in apps/api, using system python.")
        print("   (Run 'python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt' in apps/api if startup fails)")
        python_cmd = sys.executable

    # 3. Process Launch
    processes = []
    
    try:
        # Start API
        # We allow ALL origins in dev via env var if we wanted to be strict, 
        # but main.py has "*" for now.
        print("\n🚀 Launching FastAPI backend...")
        api_env = os.environ.copy()
        api_process = subprocess.Popen(
            [python_cmd, "-m", "uvicorn", "main:app", "--reload", "--port", str(api_port), "--host", "127.0.0.1"],
            cwd=str(api_dir),
            env=api_env
        )
        processes.append(api_process)
        
        # Start Web
        print("🚀 Launching Next.js frontend...")
        web_dir = root_dir / "apps" / "web"
        web_env = os.environ.copy()
        
        # Inject the dynamic API URL and Port
        web_env["NEXT_PUBLIC_API_URL"] = f"http://localhost:{api_port}"
        web_env["PORT"] = str(web_port)
        
        # Use npm run dev
        # Note: 'npm run dev' usually runs 'next dev'. Next.js respects the PORT env var.
        web_process = subprocess.Popen(
            ["npm", "run", "dev"],
            cwd=str(web_dir),
            env=web_env
        )
        processes.append(web_process)
        
        print("\n✨ Both services are running! Press Ctrl+C to stop.\n")
        
        # Wait for both processes
        # If one exits, we probably want to kill the other and exit
        while True:
            if api_process.poll() is not None:
                print("❌ API process exited unexpectedly.")
                break
            if web_process.poll() is not None:
                print("❌ Web process exited unexpectedly.")
                break
            time.sleep(0.5)
            
    except KeyboardInterrupt:
        print("\n🛑 Stopping services...")
    finally:
        for p in processes:
            if p.poll() is None:
                p.terminate()
                try:
                    p.wait(timeout=2)
                except subprocess.TimeoutExpired:
                    p.kill()
        print("👋 Goodbye!")

if __name__ == "__main__":
    main()

