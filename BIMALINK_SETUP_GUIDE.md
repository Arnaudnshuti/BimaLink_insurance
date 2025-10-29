# BimaLink Setup and Run Guide

Complete guide to run the BimaLink full-stack application successfully.

## 📋 Overview

BimaLink is an insurance platform with:
- **Backend**: Spring Boot 3.5.7 + PostgreSQL + JWT Authentication + OTP 2FA
- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS
- **Features**: Agent & Customer management, Policy lifecycle, Payments, Commission tracking

## 🏗️ Project Structure

```
BimaLink/
├── Backend/              # Spring Boot Backend
│   ├── src/main/java/    # Java source code
│   ├── pom.xml           # Maven dependencies
│   └── application.yml    # Configuration
│
└── frontend/             # React Frontend
    └── client/           # React application
        ├── pages/        # React components
        ├── services/     # API service
        └── contexts/     # React contexts
```

## 🚀 Quick Start (All Steps)

### Step 1: Setup PostgreSQL Database

**Windows (PostgreSQL installed):**
```powershell
# Create database
psql -U postgres
CREATE DATABASE bimalink_db;
CREATE USER bima_user WITH PASSWORD 'StrongPassword123';
GRANT ALL PRIVILEGES ON DATABASE bimalink_db TO bima_user;
\q
```

**Using Command Line:**
```bash
createdb bimalink_db -U postgres
```

### Step 2: Run Backend

**Prerequisites**: Java 17+, Maven 3.6+

```bash
# Navigate to backend directory
cd Backend

# Build and run the Spring Boot application
mvn clean install
mvn spring-boot:run

# Backend will run on http://localhost:8080
```

**Backend API Base URL**: `http://localhost:8081/api/v1`

**Key Endpoints:**
- `POST /api/v1/auth/register` - Register new user (agent/customer)
- `POST /api/v1/auth/verify-otp` - Verify OTP code
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/resend-otp` - Resend OTP
- `GET /api/v1/policies` - Get policies (authenticated)
- `POST /api/v1/payments/initiate` - Initiate payment

### Step 3: Run Frontend

**Prerequisites**: Node.js 18+, npm/pnpm

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
# or
pnpm install

# Run development server
npm run dev
# or
pnpm dev

# Frontend will run on http://localhost:5173
```

**Frontend URL**: `http://localhost:5173`

## 🧪 Testing the Application

### 1. Register an Agent

**Endpoint**: `POST http://localhost:8081/api/v1/auth/register`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "password": "SecurePass123",
  "role": "agent"
}
```

**Response:**
```json
{
  "token": null,
  "message": "Registration successful. Please check your email for OTP.",
  "user": null
}
```

### 2. Check Backend Logs for OTP

After registration, the OTP will be printed in backend console logs:

```
INFO [EmailService] OTP for user: john.doe@example.com is: 123456
```

### 3. Verify OTP

**Endpoint**: `POST http://localhost:8081/api/v1/auth/verify-otp`

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "OTP verified successfully",
  "user": {
    "id": "1",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "agent"
  }
}
```

### 4. Login (Alternative to OTP)

**Endpoint**: `POST http://localhost:8081/api/v1/auth/login`

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123"
}
```

**Response:** Same as OTP verification (with JWT token and user data)

### 5. Access Protected Endpoints

Use the JWT token from above in the `Authorization` header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🎯 Using the Frontend UI

### Registration Flow

1. Open browser to `http://localhost:5173`
2. Click "Register" button
3. Select "Agent" or "Customer" role
4. Fill in registration form:
   - First Name
   - Last Name
   - Email
   - Phone
   - Password (min 8 chars with uppercase, lowercase, number)
5. Click "Create Account"
6. You'll be redirected to OTP verification page
7. Enter the 6-digit OTP from backend logs
8. Click "Verify"
9. You'll be redirected to your dashboard

### Login Flow

1. Open browser to `http://localhost:5173`
2. Click "Login"
3. Enter email and password
4. Click "Sign In"
5. You'll be redirected to your dashboard

### Dashboard Access

- **Agent Dashboard**: `/dashboard` (shows KPIs, policies, commissions)
- **Customer Dashboard**: `/dashboard` (shows policies, payments)
- **Admin Dashboard**: `/dashboard` (shows analytics, reports)

## 🔧 Configuration Files

### Backend Configuration (`Backend/src/main/resources/application.yml`)

```yaml
spring:
  application:
    name: bimalink
  datasource:
    url: jdbc:postgresql://localhost:5432/bimalink_db
    username: bima_user
    password: StrongPassword123
    
server:
  port: 8080

app:
  jwt:
    secret: ${JWT_SECRET:change-this-secret-key-to-something-secure-in-production}
    expiration: 86400000
  cors:
    allowed-origins: http://localhost:4200
```

### Frontend API Configuration (`frontend/client/services/api.ts`)

```typescript
const API_BASE_URL = 'http://localhost:8080/api/v1';
```

## 📊 Sample Data for Testing

### Create Test Users

Run these SQL commands in PostgreSQL to create test users:

```sql
-- Insert admin user
INSERT INTO users (username, email, password, role, enabled, created_at, updated_at)
VALUES ('admin', 'admin@bimalink.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ROLE_ADMIN', true, NOW(), NOW());

-- Insert agent user
INSERT INTO users (username, email, password, role, enabled, created_at, updated_at)
VALUES ('agent1', 'agent1@bimalink.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ROLE_AGENT', true, NOW(), NOW());

-- Insert customer user  
INSERT INTO users (username, email, password, role, enabled, created_at, updated_at)
VALUES ('customer1', 'customer1@bimalink.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ROLE_CUSTOMER', true, NOW(), NOW());

-- Insert agent profile
INSERT INTO agents (user_id, agent_code, full_name, phone, status, created_at, updated_at)
VALUES (2, 'AGENT001', 'John Doe', '+1234567890', 'ACTIVE', NOW(), NOW());

-- Insert customer profile
INSERT INTO customers (user_id, customer_code, full_name, phone, created_at, updated_at)
VALUES (3, 'CUST001', 'Jane Smith', '+0987654321', NOW(), NOW());
```

**Note**: The password hash above is for `password123` (bcrypt)

### Test Credentials

**Admin:**
- Email: `admin@bimalink.com`
- Password: `password123`

**Agent:**
- Email: `agent1@bimalink.com`
- Password: `password123`

**Customer:**
- Email: `customer1@bimalink.com`
- Password: `password123`

## 🐛 Troubleshooting

### Backend Issues

**Problem**: Backend fails to start
- **Solution**: Ensure PostgreSQL is running and database `bimalink_db` exists
- **Check**: Run `psql -U postgres -l` to see databases

**Problem**: Port 8080 already in use
- **Solution**: Change port in `application.yml`:
  ```yaml
  server:
    port: 8081  # Use another port
  ```

**Problem**: Database connection fails
- **Solution**: Check PostgreSQL is running:
  ```powershell
  # Windows
  net start postgresql-x64-14
  
  # Check connection
  psql -U bima_user -d bimalink_db
  ```

**Problem**: Flyway migration fails
- **Solution**: Drop and recreate database:
  ```sql
  DROP DATABASE bimalink_db;
  CREATE DATABASE bimalink_db;
  ```

### Frontend Issues

**Problem**: Frontend can't connect to backend
- **Solution**: 
  1. Ensure backend is running on `http://localhost:8080`
  2. Check `API_BASE_URL` in `frontend/client/services/api.ts`
  3. Check CORS settings in `SecurityConfig.java`

**Problem**: CORS errors in browser
- **Solution**: Backend CORS is configured for `localhost:4200` (Angular), update to include React port:
  ```java
  configuration.setAllowedOrigins(List.of("http://localhost:4200", "http://localhost:5173"));
  ```

**Problem**: OTP not received
- **Solution**: Check backend logs for OTP code (it's printed to console, not sent via email in dev)

**Problem**: JWT token errors
- **Solution**: Ensure token is included in request headers:
  ```
  Authorization: Bearer <token>
  ```

### Build Issues

**Maven Build Fails:**
```bash
# Clean and rebuild
mvn clean package -DskipTests
```

**Node/npm Issues:**
```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## 📝 Environment Variables

### Backend (`application.yml`)

The backend uses these default values (can be overridden with environment variables):

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/bimalink_db
    username: bima_user
    password: StrongPassword123
    
app:
  jwt:
    secret: ${JWT_SECRET:change-this-secret-key-to-something-secure-in-production}
    expiration: 86400000 # 24 hours
```

### Setting Environment Variables (Optional)

**Windows (PowerShell):**
```powershell
$env:JWT_SECRET = "my-super-secret-key-min-32-characters"
cd Backend
mvn spring-boot:run
```

**Linux/Mac:**
```bash
export JWT_SECRET="my-super-secret-key-min-32-characters"
cd Backend
mvn spring-boot:run
```

## 🔐 Security Notes

⚠️ **For Production:**
1. Change JWT secret to a strong 32+ character string
2. Use environment variables for secrets
3. Enable HTTPS
4. Configure production CORS origins
5. Use database SSL/TLS connections
6. Implement rate limiting
7. Add input validation and sanitization
8. Use actual email service (SendGrid, AWS SES)

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```
POST /api/v1/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "SecurePass123",
  "role": "agent" // or "customer"
}
```

#### Verify OTP
```
POST /api/v1/auth/verify-otp
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456"
}
```

#### Login
```
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

#### Resend OTP
```
POST /api/v1/auth/resend-otp
Content-Type: application/json

{
  "email": "john@example.com"
}
```

### Protected Endpoints

All protected endpoints require JWT token:

```
Authorization: Bearer <your-jwt-token>
```

## 🎉 Success!

Your BimaLink application is now running! 🚀

- **Backend**: http://localhost:8081
- **Frontend**: http://localhost:8080 (Vite dev server)
- **Database**: PostgreSQL on localhost:5432

## 📞 Support

For issues or questions:
1. Check logs in console (backend)
2. Check browser console (frontend)
3. Verify database connection
4. Ensure all dependencies are installed
5. Review this guide for common issues

## 📄 License

Copyright © 2024 BimaLink Platform

---

**Next Steps:**
1. Register a test user via frontend UI
2. Check backend logs for OTP
3. Verify OTP to get JWT token
4. Access dashboard and explore features!

