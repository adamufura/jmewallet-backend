# Postman Collection Guide

## 📥 How to Import

1. Open Postman
2. Click **Import** button (top left)
3. Select `postman_collection.json` from this project
4. The collection will be imported with all folders and requests

## 📁 Collection Structure

The collection is organized into three main groups:

### 🏥 Health Check
- **Health Check** - Test if API is running

### 👤 User Endpoints
- **🔓 Public - Authentication**
  - Register User
  - Login User
- **🔒 Protected - Profile Management**
  - Get User Profile
  - Update User Profile

### 👨‍💼 Admin Endpoints
- **🔓 Public - Authentication**
  - Register Admin
  - Login Admin
- **🔒 Protected - Admin Management**
  - Get Admin Profile

## 🔑 Automatic Token Management

### How It Works

The collection includes **automatic token management scripts** that:

1. **Auto-save tokens after login/register:**
   - When you register or login as a **user**, the token is automatically saved to `USER_TOKEN`
   - When you register or login as an **admin**, the token is automatically saved to `ADMIN_TOKEN`

2. **Auto-include tokens in protected routes:**
   - User profile endpoints automatically use `{{USER_TOKEN}}`
   - Admin profile endpoints automatically use `{{ADMIN_TOKEN}}`

3. **Console logging:**
   - View detailed information in Postman Console
   - See user details, referral codes, KYC status, etc.

### Test Scripts Included

Each request has test scripts that:
- ✅ Verify status codes
- ✅ Check response structure
- ✅ Validate required fields
- ✅ Auto-save tokens to environment
- ✅ Log useful information to console

## 🚀 Quick Start

### Step 1: Set Base URL

The collection uses `{{BASE_URL}}` variable (default: `http://localhost:5000`)

**To change it:**
1. Click on the collection name
2. Go to **Variables** tab
3. Update the `BASE_URL` value
4. Save

### Step 2: Register/Login User

1. Open **User Endpoints** → **Public - Authentication**
2. Click **Register User** or **Login User**
3. Modify the request body with your details
4. Click **Send**
5. ✅ Token is **automatically saved** to `USER_TOKEN`
6. Check the **Console** (bottom) to see the saved details

### Step 3: Access Protected User Endpoints

1. Open **User Endpoints** → **Protected - Profile Management**
2. Click **Get User Profile**
3. Click **Send**
4. ✅ Token is **automatically included** in Authorization header
5. View your complete profile

### Step 4: Register/Login Admin (Separate)

1. Open **Admin Endpoints** → **Public - Authentication**
2. Click **Register Admin** or **Login Admin**
3. Modify the request body
4. Click **Send**
5. ✅ Token is **automatically saved** to `ADMIN_TOKEN`

### Step 5: Access Protected Admin Endpoints

1. Open **Admin Endpoints** → **Protected - Admin Management**
2. Click **Get Admin Profile**
3. Click **Send**
4. ✅ Admin token is **automatically included**

## 📊 Console Output Examples

### After User Login:
```
✅ User logged in successfully!
🔑 Token automatically saved to USER_TOKEN
📧 Email: john.doe@example.com
👤 Name: John Doe
✔️  KYC Status: pending
🎫 Referral Code: ABC12345
⏱️  Response time: 145ms
```

### After Admin Login:
```
✅ Admin logged in successfully!
🔑 Token automatically saved to ADMIN_TOKEN
📧 Email: admin@jmewallet.com
👤 Name: Admin User
⭐ Super Admin: false
🔄 Active: true
⏱️  Response time: 132ms
```

### After Get Profile:
```
✅ Profile retrieved successfully!
📧 Email: john.doe@example.com
👤 Name: John Doe
✔️  KYC Status: pending
📊 Verification Level: 0
💼 Wallets: 0
🎫 Referral Code: ABC12345
⏱️  Response time: 89ms
```

## 🔧 Environment Variables

The collection uses three variables:

| Variable | Type | Description | Auto-set? |
|----------|------|-------------|-----------|
| `BASE_URL` | string | API base URL | ❌ Manual |
| `USER_TOKEN` | string | User JWT token | ✅ Automatic |
| `ADMIN_TOKEN` | string | Admin JWT token | ✅ Automatic |

### View/Edit Variables:

1. Click on the collection name
2. Go to **Variables** tab
3. View current values
4. Edit if needed
5. Click **Save**

## 🧪 Testing Features

### Global Tests (Run on Every Request)

1. **Response Time Check:**
   - Ensures response is < 2000ms
   
2. **JSON Format Check:**
   - Validates response is valid JSON

3. **Console Logging:**
   - Logs response time and request URL

### Request-Specific Tests

Each endpoint has specific tests:

- **Register/Login:**
  - Status code validation
  - Token existence check
  - Auto-save token
  - User/Admin data validation

- **Get Profile:**
  - Status code validation
  - Required fields validation
  - Data structure validation

- **Update Profile:**
  - Status code validation
  - Success message validation
  - Updated data validation

### View Test Results:

1. Send a request
2. Go to **Test Results** tab
3. See all passed/failed tests

## 📋 Sample Request Bodies

### Register User
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "referralCode": ""
}
```

### Login User
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123"
}
```

### Update User Profile
```json
{
  "firstName": "Johnny",
  "lastName": "Doe",
  "phone": "+1987654321"
}
```

### Register Admin
```json
{
  "email": "admin@jmewallet.com",
  "password": "AdminPass123!",
  "name": "Admin User"
}
```

### Login Admin
```json
{
  "email": "admin@jmewallet.com",
  "password": "AdminPass123!"
}
```

## 🎯 Pro Tips

1. **Open Postman Console:**
   - View → Show Postman Console (or Ctrl/Cmd + Alt + C)
   - See detailed logs and auto-saved tokens

2. **Use Environment Variables:**
   - Create different environments for dev/staging/production
   - Switch between them easily

3. **Run Collection:**
   - Click on collection → **Run collection**
   - Run all requests in sequence
   - View test results for all endpoints

4. **Pre-request Scripts:**
   - Automatically check if tokens are available
   - Warns you if token is missing

5. **Save Responses:**
   - Click **Save Response** after sending
   - Use as examples for documentation

## 🔒 Security Notes

- Tokens are stored in environment variables
- Never commit Postman environment files with real tokens
- Use separate environments for different stages
- Clear tokens when done testing

## ❓ Troubleshooting

### "Unauthorized" Error on Protected Routes

**Problem:** Getting 401 Unauthorized

**Solution:**
1. Check if you've logged in first
2. View environment variables to confirm token is saved
3. Re-login if token expired (default: 7 days)

### Token Not Auto-Saving

**Problem:** Token not appearing in variables

**Solution:**
1. Check Postman Console for errors
2. Ensure you're using collection-level variables
3. Try manual login and check response contains token

### BASE_URL Not Working

**Problem:** Requests failing with connection error

**Solution:**
1. Check server is running (`npm run dev`)
2. Verify BASE_URL in collection variables
3. Test health endpoint first

### Different Token for User and Admin

**Problem:** User token being used for admin endpoints

**Solution:**
- User endpoints use `{{USER_TOKEN}}`
- Admin endpoints use `{{ADMIN_TOKEN}}`
- These are separate and automatically managed

## 📚 Additional Resources

- **API Documentation:** See `API_GUIDE.md`
- **Project README:** See `README.md`
- **Implementation Details:** See `IMPLEMENTATION_SUMMARY.md`

## 🎉 You're All Set!

Start by:
1. Register a user
2. Check console for saved token
3. Try protected endpoints
4. Register an admin
5. Test admin endpoints

All tokens are managed automatically! 🚀

