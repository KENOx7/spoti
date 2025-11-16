"""
Authentication functions
(Vercel-ə uyğun, heç bir dəyişiklik tələb olunmur, amma tamlıq üçün)
"""
from flask import session
from utils import get_user_by_email, get_user_by_username, verify_password, create_user, validate_email, validate_username

def login_user(email_or_username, password):
    """
    Attempt to login a user
    Returns: (success: bool, message: str, user_data: dict or None)
    """
    if not email_or_username or not password:
        return False, "Email/username and password are required", None
    
    user = get_user_by_email(email_or_username)
    if not user:
        user = get_user_by_username(email_or_username)
    
    if not user:
        return False, "Invalid email/username or password", None
    
    # Google ilə daxil olan istifadəçinin parolu olmur
    if not user.get('password_hash'):
         return False, "Please log in using Google", None

    if not verify_password(password, user.get('password_hash', '')):
        return False, "Invalid email/username or password", None
    
    # Sessiya yarat
    session.clear()
    session['user_id'] = user.get('id')
    session['username'] = user.get('username')
    session['email'] = user.get('email')
    session['guest'] = False
    
    return True, "Login successful", {
        'id': user.get('id'),
        'username': user.get('username'),
        'email': user.get('email')
    }

def signup_user(username, email, password):
    """
    Attempt to sign up a new user
    Returns: (success: bool, message: str, user_data: dict or None)
    """
    if not username or not email or not password:
        return False, "All fields are required", None
        
    if not validate_email(email):
        return False, "Invalid email format", None
        
    if not validate_username(username):
        return False, "Username must be 4-20 alphanumeric characters", None
        
    if len(password) < 8:
        return False, "Password must be at least 8 characters", None
    
    success, result, user_data = create_user(username, email, password)
    
    if success:
        # Avtomatik daxil et
        session.clear()
        session['user_id'] = user_data.get('id')
        session['username'] = user_data.get('username')
        session['email'] = user_data.get('email')
        session['guest'] = False
        
        return True, "Account created successfully", user_data
    else:
        return False, result, None

def logout_user():
    """Clear user session"""
    session.clear()
    return True, "Logged out successfully"

def set_guest_session():
    """Set session for guest user"""
    session.clear()
    session['username'] = 'Guest'
    session['email'] = None
    session['guest'] = True
    session['user_id'] = None

def get_current_user():
    """Get current user from session"""
    if not session.get('user_id') and not session.get('guest'):
        return None # Sessiya yoxdur

    if session.get('guest'):
        return {
            'username': 'Guest',
            'email': None,
            'guest': True
        }
    
    return {
        'id': session.get('user_id'),
        'username': session.get('username'),
        'email': session.get('email'),
        'guest': False
    }

def is_authenticated():
    """Check if user is logged in and not a guest"""
    return 'user_id' in session and not session.get('guest')