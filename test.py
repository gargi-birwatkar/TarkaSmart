import requests
import time

url = "https://tarkasmart.onrender.com/api/chat"
payload = {
    "message": "Explain in detail, step by step, how photosynthesis works, covering the light-dependent and light-independent reactions.",
    "google_user_id": "TARKA_GUEST_MOCK_101"
}

start = time.time()
print("Sending request...")

with requests.post(url, json=payload, stream=True) as r:
    print(f"Headers received at {time.time() - start:.2f}s")
    print(f"Transfer-Encoding: {r.headers.get('Transfer-Encoding')}")
    print(f"Content-Encoding: {r.headers.get('Content-Encoding')}")
    print("---")
    for chunk in r.iter_content(chunk_size=None):
        elapsed = time.time() - start
        print(f"[{elapsed:6.2f}s] received {len(chunk)} bytes: {chunk[:50]!r}")

print(f"\nTotal time: {time.time() - start:.2f}s")