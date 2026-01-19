import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
ENV_PATH = os.path.join(BASE_DIR, '.env')

print(f"Checking .env at: {ENV_PATH}")
print(f"File exists: {os.path.exists(ENV_PATH)}")

if os.path.exists(ENV_PATH):
    print("Content preview:")
    with open(ENV_PATH, 'r') as f:
        content = f.read()
        for line in content.splitlines():
            if 'GEMINI' in line:
                print(f"Found line: {line[:20]}...")

load_dotenv(ENV_PATH)
api_key = os.environ.get('GEMINI_API_KEY')
print(f"Loaded API Key: {'Found' if api_key else 'Missing'}")
if api_key:
    print(f"Key length: {len(api_key)}")
