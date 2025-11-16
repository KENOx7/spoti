"""
Main Flask application
(Google Auth & Vercel/Localhost Dəstəyi ilə)
"""
from flask import Flask, request, jsonify, session, redirect
from flask_cors import CORS
from auth import login_user, signup_user, logout_user, set_guest_session, get_current_user, is_authenticated
import utils
import os
import requests

# --- Google Auth ---
from dotenv import load_dotenv
from google_auth_oauthlib.flow import Flow 
import google.auth.transport.requests

load_dotenv() # .env faylındakı açarları yükləyir

app = Flask(__name__)

# --- TƏHLÜKƏSİZLİK (Açarı .env-dən oxu) ---
SECRET_KEY = os.getenv('SECRET_KEY')
if not SECRET_KEY:
    raise ValueError("Kritik səhv: 'SECRET_KEY' .env faylında tapılmadı.")
app.secret_key = SECRET_KEY

# --- CORS (Frontend-ə icazə) ---
# Vercel və localhost-a icazə ver
CORS(app, 
     supports_credentials=True, 
     origins=[
         "http://localhost:8080", 
         "http://localhost:5173", 
         "https://spoti-rose.vercel.app" # Sizin Vercel ünvanınız
     ])

# Sessiya Cookie ayarları (Production - Vercel üçün)
# 'SameSite=None' və 'Secure=True' fərqli domenlər (Vercel <-> API) arası cookie göndərmək üçün vacibdir
app.config['SESSION_COOKIE_SAMESITE'] = 'None' if os.getenv('VERCEL_URL') else 'Lax'
app.config['SESSION_COOKIE_SECURE'] = True if os.getenv('VERCEL_URL') else False
app.config['SESSION_COOKIE_HTTPONLY'] = True


# --- Dinamik URL Helper-lər ---
def get_backend_url():
    """Vercel-dədirsə Vercel URL-ini, deyilsə localhost-u qaytarır"""
    if os.getenv('VERCEL_URL'):
        return "https://spoti-rose.vercel.app" # Sizin Vercel URL
    return "http://localhost:5000"

def get_frontend_url():
    """Vercel-dədirsə Vercel URL-ini, deyilsə localhost-u qaytarır"""
    if os.getenv('VERCEL_URL'):
        return "https://spoti-rose.vercel.app" # Sizin Vercel URL
    return "http://localhost:8080" # React portunuz 5173-dürsə, onu yazın

# --- GOOGLE OAUTH QURAŞDIRILMASI ---
GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')
GOOGLE_REDIRECT_URI = f"{get_backend_url()}/api/auth/google/callback" # Dinamik URL

if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
    print("XƏBƏRDARLIQ: .env faylında GOOGLE_CLIENT_ID və ya GOOGLE_CLIENT_SECRET tapılmadı.")

# HTTP (localhost) mühitində işləmək üçün icazə
if not os.getenv('VERCEL_URL'):
    os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

client_config = {
    "web": {
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "redirect_uris": [GOOGLE_REDIRECT_URI],
        "javascript_origins": ["http://localhost:8080", "http://localhost:5173", "https://spoti-rose.vercel.app"]
    }
}

# Google Flow Obyekti
flow = Flow.from_client_config(
    client_config=client_config,
    scopes=[
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
        "openid"
    ],
    redirect_uri=GOOGLE_REDIRECT_URI
)


@app.route('/api') # /api/ kök ünvanı
def api_index():
    return jsonify({
        'status': 'ok',
        'message': 'Backend is running',
    }), 200

@app.route('/api/auth/google/login')
def google_login():
    try:
        authorization_url, state = flow.authorization_url()
        session["state"] = state # CSRF qoruması
        return jsonify({ 'success': True, 'authorization_url': authorization_url })
    except Exception as e:
        print(f"[ERROR] Google login URL generation failed: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/auth/google/callback')
def google_callback():
    try:
        if request.args.get("state") != session.get("state"):
            return "Invalid state (CSRF detected)", 401
        
        flow.fetch_token(authorization_response=request.url)
        credentials = flow.credentials
        
        # Düzgün AuthorizedSession istifadəsi (əvvəlki xətanı həll edir)
        authed_session = google.auth.transport.requests.AuthorizedSession(credentials)
        
        user_info_response = authed_session.get('https://www.googleapis.com/oauth2/v1/userinfo?alt=json')
        user_info = user_info_response.json()
        
        email = user_info.get('email')
        username = user_info.get('name', email.split('@')[0])
        google_id = user_info.get('id')
        
        success, user_data_or_error = utils.get_or_create_google_user(email, username, google_id)
        
        if not success:
            return f"Database error: {user_data_or_error}", 500

        user_data = user_data_or_error
        
        session.clear()
        session['user_id'] = user_data.get('id')
        session['username'] = user_data.get('username')
        session['email'] = user_data.get('email')
        session['guest'] = False
        
        # Uğurlu girişdən sonra Frontend-ə yönləndir
        return redirect(get_frontend_url())
        
    except Exception as e:
        print(f"[ERROR] Google Callback failed: {e}")
        return f"Google Auth Failed: {str(e)}", 500


# --- Standart API Endpointləri ---

@app.route('/api/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        if not data: return jsonify({'success': False, 'error': 'Request body required'}), 400
        success, message, user_data = signup_user(data.get('username'), data.get('email'), data.get('password'))
        if success: return jsonify({'success': True, 'message': message, 'user': user_data}), 200
        return jsonify({'success': False, 'error': message}), 400
    except Exception as e:
        print(f"[ERROR] Signup: {e}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data: return jsonify({'success': False, 'error': 'Request body required'}), 400
        success, message, user_data = login_user(data.get('username') or data.get('email'), data.get('password'))
        if success: return jsonify({'success': True, 'message': message, 'user': user_data}), 200
        return jsonify({'success': False, 'error': message}), 401
    except Exception as e:
        print(f"[ERROR] Login: {e}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

@app.route('/api/logout', methods=['POST'])
def logout():
    try:
        success, message = logout_user()
        return jsonify({'success': True, 'message': message}), 200
    except Exception as e:
        print(f"[ERROR] Logout: {e}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

@app.route('/api/check-auth', methods=['GET'])
def check_auth():
    try:
        user = get_current_user()
        if user and not user.get('guest'):
            return jsonify({'authenticated': True, 'user': user}), 200
        return jsonify({'authenticated': False, 'user': None}), 200
    except Exception as e:
        print(f"[ERROR] Check Auth: {e}")
        return jsonify({'authenticated': False, 'user': None}), 500

@app.route('/api/guest', methods=['POST'])
def set_guest():
    try:
        set_guest_session()
        return jsonify({'success': True, 'message': 'Guest session', 'user': {'username': 'Guest', 'guest': True}}), 200
    except Exception as e:
        print(f"[ERROR] Guest Session: {e}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

@app.route('/api/user/profile', methods=['GET'])
def get_profile():
    try:
        user_session = get_current_user()
        if not user_session or user_session.get('guest'):
            return jsonify({'error': 'Not authenticated'}), 401
        
        full_user_data = utils.get_user_by_id(user_session.get('id'))
        if not full_user_data:
             logout_user()
             return jsonify({'error': 'User not found'}), 404

        if 'password_hash' in full_user_data:
            del full_user_data['password_hash']
        return jsonify(full_user_data), 200
    except Exception as e:
        print(f"[ERROR] Get Profile: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/user/update-profile', methods=['POST'])
def update_profile():
    try:
        user = get_current_user()
        if not user or user.get('guest'):
            return jsonify({'success': False, 'error': 'Not authenticated'}), 401
        data = request.get_json()
        success, result = utils.update_user_profile(user.get('id'), data.get('username'), data.get('email'))
        if success:
            session['username'] = result.get('username')
            session['email'] = result.get('email')
            return jsonify({'success': True, 'user': result}), 200
        return jsonify({'success': False, 'error': result}), 400
    except Exception as e:
        print(f"[ERROR] Update Profile: {e}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

@app.route('/api/user/change-password', methods=['POST'])
def change_password():
    try:
        user = get_current_user()
        if not user or user.get('guest'):
            return jsonify({'success': False, 'error': 'Not authenticated'}), 401
        data = request.get_json()
        if len(data.get('new_password', '')) < 8:
            return jsonify({'success': False, 'error': 'Password must be at least 8 characters'}), 400
            
        success, message = utils.update_user_password(user.get('id'), data.get('new_password'))
        if success: return jsonify({'success': True, 'message': message}), 200
        return jsonify({'success': False, 'error': message}), 500
    except Exception as e:
        print(f"[ERROR] Change Password: {e}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

# Lokal maşında debug üçün
if __name__ == '__main__':
    db = utils.load_database()
    if 'users' not in db:
        db['users'] = []
        utils.save_database(db)
    
    print("=" * 50)
    print("Starting Flask Backend Server (LOCAL)")
    print("=" * 50)
    print("Server will run on: http://localhost:5000")
    print(f"Frontend expected at: {get_frontend_url()}")
    print("=" * 50)
    
    app.run(host='localhost', port=5000, debug=True)