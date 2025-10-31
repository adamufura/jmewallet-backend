# JME Wallet Backend

A secure crypto trading platform backend built with Node.js, Express, TypeScript, and MongoDB.

## Features

- 🔐 **Separate Authentication Systems** - Independent auth for Users and Admins
- 🛡️ **JWT Authentication** - Secure token-based authentication
- 💼 **User Management** - Complete user profiles with KYC, wallets, and referral system
- 👮 **Admin Panel** - Admin authentication with role management
- 🔒 **Security** - Helmet, CORS, Rate Limiting, and password hashing
- 📝 **Validation** - Express-validator for input validation
- 🗄️ **MongoDB** - Document database with Mongoose ODM

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB (Atlas)
- **Authentication**: JWT (jsonwebtoken)
- **Security**: Helmet, bcryptjs, express-rate-limit
- **Validation**: express-validator

## Installation

1. Clone the repository

```bash
git clone https://github.com/adamufura/jmewallet-backend.git
cd jmewallet-backend
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables
   Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGO_URI=mongodb+srv://

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

4. Start the development server

```bash
npm run dev
```

5. Build for production

```bash
npm run build
npm start
```

## API Endpoints

### User Endpoints (`/api/users`)

#### Public Routes

- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - User login

#### Protected Routes (require JWT)

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Admin Endpoints (`/api/admin`)

#### Public Routes

- `POST /api/admin/register` - Register a new admin
- `POST /api/admin/login` - Admin login

#### Protected Routes (require JWT)

- `GET /api/admin/profile` - Get admin profile

### Health Check

- `GET /health` - Check API status

## User Registration Example

```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "referralCode": "OPTIONAL123"
  }'
```

## User Login Example

```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123"
  }'
```

## Protected Route Example

```bash
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## User Model Fields

- **Basic Info**: email, password, firstName, lastName, phone
- **KYC**: kycStatus (pending/verified/rejected), verificationLevel (0-3), kycDocuments
- **Crypto**: wallets array (currency, address, balance), balances map
- **Referral**: referralCode (auto-generated), referredBy
- **Metadata**: isActive, lastLogin, createdAt, updatedAt

## Admin Model Fields

- **Basic Info**: email, password, name
- **Access**: isActive, isSuperAdmin
- **Metadata**: lastLogin, createdAt, updatedAt

## Security Features

- Password hashing with bcryptjs (10 rounds)
- JWT token-based authentication
- Rate limiting on authentication endpoints
- Helmet for security headers
- CORS configuration
- Input validation with express-validator
- MongoDB injection prevention

## Project Structure

```
src/
├── config/
│   └── database.ts          # MongoDB connection
├── controllers/
│   ├── admin.controller.ts  # Admin business logic
│   └── user.controller.ts   # User business logic
├── middleware/
│   ├── auth.middleware.ts   # JWT authentication
│   ├── error.middleware.ts  # Error handling
│   └── validation.middleware.ts
├── models/
│   ├── admin.model.ts       # Admin schema
│   └── user.model.ts        # User schema
├── routes/
│   ├── admin.routes.ts      # Admin endpoints
│   └── user.routes.ts       # User endpoints
├── types/
│   └── index.ts             # TypeScript interfaces
├── utils/
│   ├── jwt.ts               # JWT helpers
│   └── response.ts          # Response helpers
├── validators/
│   ├── admin.validator.ts   # Admin validation rules
│   └── user.validator.ts    # User validation rules
└── index.ts                 # Application entry point
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server

## License

ISC
