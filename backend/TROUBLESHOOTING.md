# Troubleshooting Guide

## ERR_CONNECTION_REFUSED Errors

### Problem: Cannot connect to backend

**Solution 1: Check if backend is running**
```bash
cd backend
python app.py
```

You should see:
```
==================================================
Starting Flask Backend Server
==================================================
Server will run on: http://127.0.0.1:5000
```

**Solution 2: Check port 5000**
- Make sure nothing else is using port 5000
- Try changing port in `app.py` if needed

**Solution 3: Check firewall**
- Windows Firewall might be blocking the connection
- Allow Python through firewall

**Solution 4: Verify backend is accessible**
Open browser: `http://127.0.0.1:5000`
Should show: `{"status": "ok", "message": "Backend is running"}`

## Signup Errors

### Problem: "Signup failed - An error occurred"

**Check:**
1. Backend is running on `http://127.0.0.1:5000`
2. Check browser console for detailed error
3. Check backend terminal for error messages
4. Verify `database.json` file exists and is writable

**Common issues:**
- Backend not running → Start backend
- Port conflict → Change port or kill process
- Database file permissions → Check file permissions

## Login Options

**Available login methods:**
- Email/Password login
- Guest mode (no login required)
- Sign up for new accounts

**Note:** OAuth providers (Google, Facebook) have been removed. Only email/password authentication is available.

## Testing Backend

### Test signup:
```bash
curl -X POST http://127.0.0.1:5000/api/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"password123"}'
```

### Test login:
```bash
curl -X POST http://127.0.0.1:5000/api/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"username":"test","password":"password123"}'
```

### Test check-auth:
```bash
curl -X GET http://127.0.0.1:5000/api/check-auth \
  -b cookies.txt
```

## Frontend Connection

Make sure frontend uses:
- Base URL: `http://127.0.0.1:5000`
- Credentials: `credentials: 'include'` in fetch
- CORS: Backend allows `localhost:8080` and `127.0.0.1:8080`

## Quick Fixes

1. **Restart backend**: Stop (Ctrl+C) and restart `python app.py`
2. **Clear browser cache**: Hard refresh (Ctrl+Shift+R)
3. **Check both terminals**: Backend AND frontend must be running
4. **Check URLs**: Frontend should use `http://127.0.0.1:5000` (not relative paths)

