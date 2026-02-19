import hashlib
import os
from backend.app.config import MAX_FILE_SIZE_BYTES, ALLOWED_IMAGE_TYPES, ALLOWED_AUDIO_TYPES, ALLOWED_VIDEO_TYPES


def validate_file_size(file_size: int) -> bool:
    return file_size <= MAX_FILE_SIZE_BYTES


def validate_file_type(content_type: str, scan_type: str) -> bool:
    allowed = {
        "image": ALLOWED_IMAGE_TYPES,
        "audio": ALLOWED_AUDIO_TYPES,
        "video": ALLOWED_VIDEO_TYPES,
    }
    return content_type in allowed.get(scan_type, set())


def compute_file_hash(file_path: str) -> str:
    sha256 = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            sha256.update(chunk)
    return sha256.hexdigest()


def sanitize_filename(filename: str) -> str:
    basename = os.path.basename(filename)
    safe = "".join(c for c in basename if c.isalnum() or c in "._-")
    return safe or "upload"
