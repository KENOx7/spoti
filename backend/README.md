# Backend API Documentation

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Run the Server

```bash
python app.py
```

The server will start on `http://127.0.0.1:5000`

## API Endpoints

All endpoints return JSON responses.

Base URL: `http://127.0.0.1:5000`

### 1. Health Check

**GET** `/`

Returns server status and available endpoints.

**Response:**
```json
{
  "status": "ok",
  "message": "Backend is running",
  "endpoints": {...}
}
```

### 2. Sign Up

**POST** `/api/signup`

Create a new user account.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Account created successfully",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Email already exists"
}
```

### 3. Login

**POST** `/api/login`

Login with email/username and password.

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "password123"
}
```

Or:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": "Invalid email/username or password"
}
```

### 4. Logout

**POST** `/api/logout`

Logout the current user and clear session.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### 5. Check Authentication

**GET** `/api/check-auth`

Check if user is authenticated.

**Success Response (200):**
```json
{
  "authenticated": true,
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "guest": false
  }
}
```

**Guest Response (200):**
```json
{
  "authenticated": false,
  "user": {
    "username": "Guest",
    "email": null,
    "guest": true
  }
}
```

### 6. Set Guest Mode

**POST** `/api/guest`

Set user as guest (optional login).

**Success Response (200):**
```json
{
  "success": true,
  "message": "Guest session created",
  "user": {
    "username": "Guest",
    "email": null,
    "guest": true
  }
}
```

### 7. Get User Profile

**GET** `/api/user/profile`

Get current user profile.

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "guest": false
  }
}
```

**Error Response (401):**
```json
{
  "error": "Not authenticated"
}
```

## Frontend Integration Examples

### Sign Up

```javascript
const response = await fetch('http://127.0.0.1:5000/api/signup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify({
    username: 'johndoe',
    email: 'john@example.com',
    password: 'password123'
  })
});

const data = await response.json();
```

### Login

```javascript
const response = await fetch('http://127.0.0.1:5000/api/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify({
    username: 'johndoe', // or email: 'john@example.com'
    password: 'password123'
  })
});

const data = await response.json();
```

### Check Auth

```javascript
const response = await fetch('http://127.0.0.1:5000/api/check-auth', {
  method: 'GET',
  credentials: 'include'
});

const data = await response.json();
```

### Logout

```javascript
const response = await fetch('http://127.0.0.1:5000/api/logout', {
  method: 'POST',
  credentials: 'include'
});

const data = await response.json();
```

### Set Guest Mode

```javascript
const response = await fetch('http://127.0.0.1:5000/api/guest', {
  method: 'POST',
  credentials: 'include'
});

const data = await response.json();
```

## Validation Rules

- **Username**: 4-20 characters, alphanumeric only
- **Email**: Valid email format
- **Password**: Minimum 8 characters
- **Email uniqueness**: Each email can only be used once
- **Username uniqueness**: Each username can only be used once

## Session Management

- Sessions are stored using Flask sessions
- Sessions use cookies with `SameSite=Lax` for CORS compatibility
- Guest sessions have `guest: true` flag
- Authenticated sessions have user ID, username, and email

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200`: Success
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (authentication failed)
- `500`: Internal Server Error

## Database

Users are stored in `database.json` file in JSON format:

```json
{
  "users": [
    {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "password_hash": "$2b$12$...",
      "created_at": "2024-01-01T00:00:00",
      "guest": false
    }
  ]
}
```

Passwords are hashed using bcrypt before storage.

