# Quick Start - Backend

## 🚀 Run in 3 Steps

### Step 1: Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### Step 2: Start Server
```bash
python app.py
```

### Step 3: Verify
Open browser: `http://127.0.0.1:5000`

You should see: `{"status": "ok", "message": "Backend is running", ...}`

## ✅ That's It!

The backend is now running and ready to accept requests from your React frontend.

## 📝 Example Frontend Code

### Sign Up
```javascript
fetch('http://127.0.0.1:5000/api/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123'
  })
})
```

### Login
```javascript
fetch('http://127.0.0.1:5000/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    username: 'testuser',
    password: 'password123'
  })
})
```

### Check Auth
```javascript
fetch('http://127.0.0.1:5000/api/check-auth', {
  method: 'GET',
  credentials: 'include'
})
```

### Logout
```javascript
fetch('http://127.0.0.1:5000/api/logout', {
  method: 'POST',
  credentials: 'include'
})
```

## 🔧 Troubleshooting

**Port in use?** Change port in `app.py` line 95: `port=5001`

**CORS errors?** Backend allows: `localhost:8080`, `127.0.0.1:8080`, `localhost:5173`, `127.0.0.1:5173`

**Module errors?** Run: `pip install -r requirements.txt`

## 📚 Full Documentation

See `README.md` for complete API documentation.

