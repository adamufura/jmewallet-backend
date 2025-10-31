# JME Wallet API Testing Guide

## Quick Start

1. **Start the development server:**
```bash
npm run dev
```

2. **Check health status:**
```bash
GET http://localhost:5000/health
```

## API Endpoints

### User Endpoints

#### 1. Register a New User
```bash
POST http://localhost:5000/api/users/register
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "referralCode": "OPTIONAL123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "...",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+1234567890",
      "kycStatus": "pending",
      "verificationLevel": 0,
      "referralCode": "ABC12345",
      "isActive": true
    }
  }
}
```

#### 2. User Login
```bash
POST http://localhost:5000/api/users/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "...",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "kycStatus": "pending",
      "verificationLevel": 0,
      "referralCode": "ABC12345",
      "wallets": [],
      "balances": {},
      "lastLogin": "2024-10-31T23:00:00.000Z",
      "isActive": true
    }
  }
}
```

#### 3. Get User Profile (Protected)
```bash
GET http://localhost:5000/api/users/profile
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "kycStatus": "pending",
    "verificationLevel": 0,
    "kycDocuments": [],
    "wallets": [],
    "balances": {},
    "referralCode": "ABC12345",
    "lastLogin": "2024-10-31T23:00:00.000Z",
    "isActive": true,
    "createdAt": "2024-10-31T23:00:00.000Z",
    "updatedAt": "2024-10-31T23:00:00.000Z"
  }
}
```

#### 4. Update User Profile (Protected)
```bash
PUT http://localhost:5000/api/users/profile
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "firstName": "Johnny",
  "lastName": "Doe",
  "phone": "+1987654321"
}
```

### Admin Endpoints

#### 1. Register a New Admin
```bash
POST http://localhost:5000/api/admin/register
Content-Type: application/json

{
  "email": "admin@jmewallet.com",
  "password": "AdminPass123!",
  "name": "Admin User"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Admin registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "id": "...",
      "email": "admin@jmewallet.com",
      "name": "Admin User",
      "isActive": true,
      "isSuperAdmin": false
    }
  }
}
```

#### 2. Admin Login
```bash
POST http://localhost:5000/api/admin/login
Content-Type: application/json

{
  "email": "admin@jmewallet.com",
  "password": "AdminPass123!"
}
```

#### 3. Get Admin Profile (Protected)
```bash
GET http://localhost:5000/api/admin/profile
Authorization: Bearer YOUR_ADMIN_JWT_TOKEN
```

## Testing with cURL

### Register User
```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"SecurePass123\",\"firstName\":\"Test\",\"lastName\":\"User\",\"phone\":\"+1234567890\"}"
```

### Login User
```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"SecurePass123\"}"
```

### Get Profile (replace TOKEN with your JWT)
```bash
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Testing with Postman

1. Import the following environment variables:
   - `BASE_URL`: `http://localhost:5000`
   - `USER_TOKEN`: (will be set after login)
   - `ADMIN_TOKEN`: (will be set after admin login)

2. Create requests for each endpoint
3. Use `{{BASE_URL}}` for the base URL
4. Use `{{USER_TOKEN}}` or `{{ADMIN_TOKEN}}` for protected routes

## Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": [
    {
      "msg": "Please provide a valid email",
      "param": "email",
      "location": "body"
    }
  ]
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "error": "No token provided"
}
```

### Not Found (404)
```json
{
  "success": false,
  "error": "Route not found - /api/invalid-route"
}
```

## Security Features

- ✅ Password hashing with bcryptjs
- ✅ JWT token authentication
- ✅ Rate limiting on auth endpoints (100 requests per 15 minutes)
- ✅ Input validation with express-validator
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ Separate user and admin authentication

## User Model Features

### Basic Information
- Email (unique, validated)
- Password (hashed)
- First Name & Last Name
- Phone (optional)

### KYC Features
- KYC Status: pending, verified, rejected
- Verification Level: 0-3
- KYC Documents array

### Crypto Features
- Wallets array (currency, address, balance)
- Balances map (currency: amount)

### Referral System
- Auto-generated referral code
- Track who referred the user

### Metadata
- Active status
- Last login timestamp
- Created/Updated timestamps

## Admin Model Features

### Basic Information
- Email (unique, validated)
- Password (hashed - minimum 8 characters)
- Name

### Access Control
- Active status
- Super Admin flag

### Metadata
- Last login timestamp
- Created/Updated timestamps

## Next Steps

1. **Add more user features:**
   - Email verification
   - Password reset
   - Two-factor authentication
   - KYC document upload

2. **Add admin features:**
   - Manage users
   - Approve/reject KYC
   - View analytics
   - Manage transactions

3. **Add crypto features:**
   - Wallet generation
   - Deposit/withdrawal
   - Trading functionality
   - Transaction history

4. **Add security features:**
   - IP whitelisting
   - Audit logs
   - Session management
   - API key management

