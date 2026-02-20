from backend.app.database import SessionLocal
from backend.app.services.auth_service import signup_user
import traceback

try:
    db = SessionLocal()
    print("Testing signup...")
    signup_user(db, 'admin@finshield.ai', 'admin', 'admin123')
except Exception as e:
    with open("error.log", "w") as f:
        traceback.print_exc(file=f)
    print("Error saved to error.log")
finally:
    db.close()
