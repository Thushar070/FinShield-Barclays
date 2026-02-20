import sys
import logging
logging.basicConfig(level=logging.INFO)

from backend.app.database import SessionLocal
from backend.app.services.auth_service import login_user

db = SessionLocal()
try:
    print("Testing login_user...")
    res = login_user(db, "test@example.com", "wrongpass")
    print(res)
except Exception as e:
    import traceback
    traceback.print_exc()
finally:
    db.close()
