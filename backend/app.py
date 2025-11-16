"""
Main Flask application
(Vercel & Localhost Compatible)
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

load_dotenv()

app = Flask(__name__)

# --- TƏHLÜKƏSİZLİK ---
# Vercel-də environment variable olaraq təyin ediləcək
SECRET_KEY = os.getenv('SECRET_KEY', 'dev_secret_key_local')
app.secret_key = SECRET_KEY

# --- CORS (Frontend-ə icazə) ---
# İcazə verilən frontend ünvanları
ALLOWED_ORIGINS = [
    "http://localhost:8080",
    "http://localhost:5173",
    "https://spoti-rose.vercel.app" # Sizin Vercel ünvanınız
]

CORS(app, supports_credentials=True, origins=ALLOWED_ORIGINS)

app.config['SESSION_COOKIE_SAMESITE'] = 'None' # Production (HTTPS) üçün 'None' vacibdir
app.config['SESSION_COOKIE_SECURE'] = True # HTTPS üçün True olmalıdır (Localhost-da bəzən problem ola bilər, amma müasir brauzerlər localhost-u istisna edir)
app.config['SESSION_COOKIE_HTTPONLY'] = True

# --- MÜHİTİ TƏYİN ET (Local vs Production) ---
def get_redirect_uri():
    # Əgər Vercel-dəyiksə və ya Production-dursa
    if os.getenv('VERCEL_URL') or os.getenv('FLASK_ENV') == 'production':
        return "https://spoti-rose.vercel.app/api/auth/google/callback"
    return "http://localhost:5000/api/auth/google/callback"

def get_frontend_url():
    if os.getenv('VERCEL_URL') or os.getenv('FLASK_ENV') == 'production':
        return "https://spoti-rose.vercel.app"
    return "http://localhost:8080"

# --- GOOGLE OAUTH ---
GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')

# HTTPS tələbini yalnız localda söndürürük
if not os.getenv('VERCEL_URL'):
    os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

@app.route('/')
def index():
    return jsonify({'status': 'ok', 'message': 'Backend is running on Vercel/Local'})

@app.route('/api/auth/google/login')
def google_login():
    try:
        redirect_uri = get_redirect_uri()
        
        client_config = {
            "web": {
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [redirect_uri]
            }
        }

        flow = Flow.from_client_config(
            client_config=client_config,
            scopes=[
                "https://www.googleapis.com/auth/userinfo.profile",
                "https://www.googleapis.com/auth/userinfo.email",
                "openid"
            ],
            redirect_uri=redirect_uri
        )

        authorization_url, state = flow.authorization_url()
        session["state"] = state
        
        return jsonify({'success': True, 'authorization_url': authorization_url})
    except Exception as e:
        print(f"[ERROR] Google login failed: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/auth/google/callback')
def google_callback():
    try:
        redirect_uri = get_redirect_uri()
        
        if request.args.get("state") != session.get("state"):
            return "Invalid state", 401
        
        client_config = {
            "web": {
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [redirect_uri]
            }
        }

        flow = Flow.from_client_config(
            client_config=client_config,
            scopes=[
                "https://www.googleapis.com/auth/userinfo.profile",
                "https://www.googleapis.com/auth/userinfo.email",
                "openid"
            ],
            redirect_uri=redirect_uri
        )

        flow.fetch_token(authorization_response=request.url)
        credentials = flow.credentials

        # --- DÜZƏLİŞ: AuthorizedSession yalnız credentials alır ---
        authed_session = google.auth.transport.requests.AuthorizedSession(credentials)

        user_info_response = authed_session.get(
            'https://www.googleapis.com/oauth2/v1/userinfo?alt=json'
        )
        user_info = user_info_response.json()
        
        email = user_info.get('email')
        username = user_info.get('name') or email.split('@')[0]
        google_id = user_info.get('id')
        
        success, user_data = utils.get_or_create_google_user(email, username, google_id)
        
        if not success:
            return f"Database error: {user_data}", 500

        session.clear()
        session['user_id'] = user_data.get('id')
        session['username'] = user_data.get('username')
        session['email'] = user_data.get('email')
        session['guest'] = False
        
        # Frontend-ə dinamik yönləndirmə
        return redirect(get_frontend_url())
        
    except Exception as e:
        print(f"[ERROR] Google Callback failed: {e}")
        return f"Google Auth Failed: {e}", 500

# --- Standart API Endpointləri ---
@app.route('/api/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        success, message, user_data = signup_user(data.get('username'), data.get('email'), data.get('password'))
        if success: return jsonify({'success': True, 'message': message, 'user': user_data}), 200
        return jsonify({'success': False, 'error': message}), 400
    except Exception as e: return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        success, message, user_data = login_user(data.get('username') or data.get('email'), data.get('password'))
        if success: return jsonify({'success': True, 'message': message, 'user': user_data}), 200
        return jsonify({'success': False, 'error': message}), 401
    except Exception as e: return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/logout', methods=['POST'])
def logout():
    logout_user()
    return jsonify({'success': True, 'message': 'Logged out'}), 200

@app.route('/api/check-auth', methods=['GET'])
def check_auth():
    user = get_current_user()
    if user and not user.get('guest'): return jsonify({'authenticated': True, 'user': user}), 200
    return jsonify({'authenticated': False, 'user': None}), 200

@app.route('/api/guest', methods=['POST'])
def set_guest():
    set_guest_session()
    return jsonify({'success': True, 'message': 'Guest session', 'user': {'username': 'Guest', 'guest': True}}), 200

@app.route('/api/user/profile', methods=['GET'])
def get_profile():
    user_session = get_current_user()
    if not user_session or user_session.get('guest'): return jsonify({'error': 'Not authenticated'}), 401
    full_user = utils.get_user_by_id(user_session.get('id'))
    if not full_user: 
        logout_user()
        return jsonify({'error': 'User not found'}), 404
    if 'password_hash' in full_user: del full_user['password_hash']
    return jsonify(full_user), 200

@app.route('/api/user/update-profile', methods=['POST'])
def update_profile():
    user = get_current_user()
    if not user or user.get('guest'): return jsonify({'success': False, 'error': 'Not auth'}), 401
    data = request.get_json()
    success, res = utils.update_user_profile(user.get('id'), data.get('username'), data.get('email'))
    if success:
        session['username'] = res.get('username')
        session['email'] = res.get('email')
        return jsonify({'success': True, 'user': res}), 200
    return jsonify({'success': False, 'error': res}), 400

@app.route('/api/user/change-password', methods=['POST'])
def change_password():
    user = get_current_user()
    if not user or user.get('guest'): return jsonify({'success': False, 'error': 'Not auth'}), 401
    success, msg = utils.update_user_password(user.get('id'), request.get_json().get('new_password'))
    if success: return jsonify({'success': True, 'message': msg}), 200
    return jsonify({'success': False, 'error': msg}), 500

if __name__ == '__main__':
    app.run(host='localhost', port=5000, debug=True)