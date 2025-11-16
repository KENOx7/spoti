# Backend Setup Guide

## Quick Start

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

If you're using a virtual environment (recommended):

```bash
# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Run the Server

```bash
python app.py
```

You should see:
```
==================================================
Starting Flask Backend Server
==================================================
Server will run on: http://127.0.0.1:5000
CORS enabled for: http://localhost:8080, http://127.0.0.1:8080
==================================================
 * Running on http://127.0.0.1:5000
```

### 4. Test the Server

Open your browser and go to: `http://127.0.0.1:5000`

You should see a JSON response with server status.

## Project Structure

```
backend/
├── app.py              # Main Flask application
├── auth.py             # Authentication functions
├── utils.py            # Utility functions (database, validation)
├── database.json       # User storage (auto-created)
├── requirements.txt    # Python dependencies
├── README.md          # API documentation
├── SETUP_GUIDE.md     # This file
└── static/            # Static files folder
```

## Features

✅ **Sign Up** - Create new accounts with email, username, password
✅ **Login** - Authenticate with email/username and password
✅ **Logout** - Clear session
✅ **Guest Mode** - Optional login, works without authentication
✅ **Session Management** - Flask sessions with cookies
✅ **CORS Enabled** - Works with React frontend
✅ **JSON Storage** - Simple file-based user storage
✅ **Password Hashing** - Secure bcrypt hashing

## Troubleshooting

### Port Already in Use

If port 5000 is already in use:

1. Find the process using port 5000:
   ```bash
   # Windows
   netstat -ano | findstr :5000
   
   # Mac/Linux
   lsof -i :5000
   ```

2. Kill the process or change the port in `app.py`:
   ```python
   app.run(host='127.0.0.1', port=5001, debug=True)
   ```

### Module Not Found Errors

Make sure you've installed all dependencies:
```bash
pip install -r requirements.txt
```

### CORS Errors

The backend is configured to allow requests from:
- `http://localhost:8080`
- `http://127.0.0.1:8080`
- `http://localhost:5173`
- `http://127.0.0.1:5173`

If your frontend runs on a different port, update the CORS origins in `app.py`.

### Database File Issues

The `database.json` file is created automatically. If you encounter issues:

1. Make sure the `backend` directory is writable
2. Check file permissions
3. Delete `database.json` and restart the server (it will be recreated)

## Testing with curl

### Sign Up
```bash
curl -X POST http://127.0.0.1:5000/api/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
```

### Login
```bash
curl -X POST http://127.0.0.1:5000/api/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"username":"testuser","password":"password123"}'
```

### Check Auth
```bash
curl -X GET http://127.0.0.1:5000/api/check-auth \
  -b cookies.txt
```

### Logout
```bash
curl -X POST http://127.0.0.1:5000/api/logout \
  -b cookies.txt
```

## Production Considerations

For production use:

1. **Change Secret Key**: Set `SECRET_KEY` environment variable
2. **Use Database**: Replace JSON storage with PostgreSQL/MySQL
3. **Add HTTPS**: Use a reverse proxy (nginx) with SSL
4. **Rate Limiting**: Add rate limiting to prevent abuse
5. **Input Sanitization**: Add more validation and sanitization
6. **Logging**: Add proper logging system
7. **Error Handling**: Improve error messages (don't expose internals)

## Next Steps

1. Start the backend: `python app.py`
2. Update frontend to use the new backend endpoints
3. Test signup, login, logout, and guest mode
4. Verify all features work correctly

The backend is ready to use! 🚀

