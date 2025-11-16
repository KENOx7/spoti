"""
Authentication functions
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
    
    # Try to find user by email first, then by username
    user = get_user_by_email(email_or_username)
    if not user:
        user = get_user_by_username(email_or_username)
    
    if not user:
        return False, "Invalid email/username or password", None
    
    # Verify password
    if not verify_password(password, user.get('password_hash', '')):
        return False, "Invalid email/username or password", None
    
    # Create session
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
    Create a new user account
    Returns: (success: bool, message: str, user_data: dict or None)
    """
    # Validate input
    if not username or not email or not password:
        return False, "Username, email, and password are required", None
    
    # Validate email format
    if not validate_email(email):
        return False, "Invalid email format", None
    
    # Validate username format
    if not validate_username(username):
        return False, "Username must be 4-20 characters long and contain only letters and numbers", None
    
    # Validate password length
    if len(password) < 8:
        return False, "Password must be at least 8 characters long", None
    
    # Create user
    success, result = create_user(username, email, password)
    
    if success:
        user_data = result
        # Create session
        session['user_id'] = user_data.get('id')
        session['username'] = user_data.get('username')
        session['email'] = user_data.get('email')
        session['guest'] = False
        
        return True, "Account created successfully", {
            'id': user_data.get('id'),
            'username': user_data.get('username'),
            'email': user_data.get('email')
        }
    else:
        return False, result, None


def logout_user():
    """Clear user session"""
    session.clear()
    return True, "Logged out successfully"


def set_guest_session():
    """Set session for guest user"""
    session['username'] = 'Guest'
    session['email'] = None
    session['guest'] = True
    session['user_id'] = None


def get_current_user():
    """Get current user from session"""
    if session.get('guest'):
        return {
            'username': 'Guest',
            'email': None,
            'guest': True
        }
    
    if session.get('username'):
        return {
            'id': session.get('user_id'),
            'username': session.get('username'),
            'email': session.get('email'),
            'guest': False
        }
    
    return None


def is_authenticated():
    """Check if user is authenticated (not guest)"""
    return session.get('username') and not session.get('guest', False)

