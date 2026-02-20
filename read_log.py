import codecs
import re

try:
    with codecs.open("uvicorn_log.txt", "r", encoding="utf-16le") as f:
        content = f.read()
    
    # Simple regex to find the traceback
    start = content.rfind("Traceback (most recent call last)")
    if start != -1:
        print("FOUND TRACEBACK:")
        print(content[start:start+2000])
    else:
        print("No traceback found. Last 2000 chars:")
        print(content[-2000:])
except Exception as e:
    print(f"Error reading log: {e}")
