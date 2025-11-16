"""
Utility functions for the backend
(Google Auth və Bütün Kritik Düzəlişlər Daxil Edilib)
"""
import json
import os
import bcrypt
import re
import uuid
import threading
from datetime import datetime

DATABASE_FILE = os.path.join(os.path.dirname(__file__), 'database.json')

# --- KRİTİK DÜZƏLİŞ (RACE CONDITION) ---
db_lock = threading.Lock()
# ----------------------------------------


def load_database():
    """Load users from database.json"""
    try:
        if os.path.exists(DATABASE_FILE):
            with open(DATABASE_FILE, 'r') as f:
                content = f.read()
                if not content:
                    return {"users": []}
                return json.loads(content)
        return {"users": []}
    except json.JSONDecodeError:
        print("[ERROR] Database file is corrupted or empty. Resetting.")
        return {"users": []}
    except Exception as e:
        print(f"[ERROR] Failed to load database: {e}")
        return {"users": []}


def save_database(data):
    """
    Save users to database.json (thread-safe).
    Bu funksiya yalnız kilid daxilində çağırılmalıdır.
    """
    try:
        with open(DATABASE_FILE, 'w') as f:
            json.dump(data, f, indent=2)
        return True
    except Exception as e:
        print(f"[ERROR] Failed to save database: {e}")
        return False


def hash_password(password):
    """Hash a password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def verify_password(password, password_hash):
    """Verify a password against a hash"""
    try:
        if not password_hash: # Google ilə daxil olanlar üçün
            return False
        return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))
    except Exception as e:
        print(f"[ERROR] Password verification failed: {e}")
        return False


def get_user_by_email(email):
    """Get user by email from database"""
    db = load_database()
    for user in db.get('users', []):
        if user.get('email') == email:
            return user
    return None


def get_user_by_username(username):
    """Get user by username from database"""
    db = load_database()
    for user in db.get('users', []):
        if user.get('username') == username:
            return user
    return None


def get_user_by_id(user_id):
    """Get user by ID from database"""
    db = load_database()
    for user in db.get('users', []):
        if user.get('id') == user_id:
            return user
    return None


def create_user(username, email, password):
    """
    Create a new user in the database (thread-safe).
    """
    with db_lock:
        db = load_database()
        users = db.get('users', [])
        
        if any(user.get('email') == email for user in users):
            return False, "Email already exists"
        
        if any(user.get('username') == username for user in users):
            return False, "Username already exists"
        
        new_user = {
            "id": str(uuid.uuid4()),
            "username": username,
            "email": email,
            "password_hash": hash_password(password), # Normal qeydiyyat
            "created_at": datetime.now().isoformat(),
            "guest": False,
            "avatar_url": None,
            "google_id": None # Normal qeydiyyat
        }
        
        users.append(new_user)
        db['users'] = users
        
        if save_database(db):
            user_data_to_return = new_user.copy()
            del user_data_to_return['password_hash']
            return True, user_data_to_return
        else:
            return False, "Failed to save user"


# --- GOOGLE ÜÇÜN YENİ FUNKSİYA ---
def get_or_create_google_user(email, username, google_id):
    """
    Find user by email (from Google) or create a new one (thread-safe).
    """
    with db_lock:
        db = load_database()
        users = db.get('users', [])
        
        # Emaillə axtar
        existing_user = next((u for u in users if u.get('email') == email), None)
        
        if existing_user:
            # İstifadəçi tapıldı, məlumatlarını qaytar
            user_data = existing_user.copy()
            if 'password_hash' in user_data:
                del user_data['password_hash']
            return True, user_data

        # Tapılmadı, yeni Google istifadəçisi yarat
        new_user = {
            "id": str(uuid.uuid4()),
            "username": username, # Google-dan gələn ad
            "email": email,
            "password_hash": None, # Google ilə daxil olur, parolu yoxdur
            "created_at": datetime.now().isoformat(),
            "guest": False,
            "avatar_url": None, # Google-dan gələn şəkli bura qoymaq olar
            "google_id": google_id
        }
        
        users.append(new_user)
        db['users'] = users
        
        if save_database(db):
            user_data_to_return = new_user.copy()
            return True, user_data_to_return
        else:
            return False, "Failed to save Google user"


def update_user_profile(user_id, new_username, new_email):
    """
    Update a user's profile information (thread-safe).
    """
    with db_lock:
        db = load_database()
        users = db.get('users', [])
        
        user_to_update = None
        for user in users:
            if user.get('id') == user_id:
                user_to_update = user
                break
        
        if not user_to_update:
            return False, "User not found"

        if new_email != user_to_update.get('email') and any(u.get('email') == new_email for u in users):
             return False, "Email already exists"
        
        if new_username != user_to_update.get('username') and any(u.get('username') == new_username for u in users):
             return False, "Username already exists"

        user_to_update['username'] = new_username
        user_to_update['email'] = new_email
        
        if save_database(db):
            user_data_to_return = user_to_update.copy()
            if 'password_hash' in user_data_to_return:
                del user_data_to_return['password_hash']
            return True, user_data_to_return
        else:
            return False, "Failed to save profile changes"


def update_user_password(user_id, new_password):
    """
    Update a user's password (thread-safe).
    """
    with db_lock:
        db = load_database()
        users = db.get('users', [])
        
        user_to_update = None
        for user in users:
            if user.get('id') == user_id:
                user_to_update = user
                break
        
        if not user_to_update:
            return False, "User not found"
        
        user_to_update['password_hash'] = hash_password(new_password)
        
        if save_database(db):
            return True, "Password changed successfully"
        else:
            return False, "Failed to save new password"


def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def validate_username(username):
    """Validate username format (4-20 alphanumeric characters)"""
    pattern = r'^[a-zA-Z0-9]{4,20}$'
    return re.match(pattern, username) is not None