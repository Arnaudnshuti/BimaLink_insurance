# BimaLink Frontend - React Application

A modern, production-ready insurance agent and policy management platform built with React, TypeScript, and TailwindCSS.

## Table of Contents
- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Configuration](#configuration)
- [Features](#features)
- [API Integration](#api-integration)
- [Required Backend Endpoints](#required-backend-endpoints)
- [Authentication Flow](#authentication-flow)
- [Internationalization (i18n)](#internationalization-i18n)
- [Dark Mode](#dark-mode)
- [Component Library](#component-library)

## Overview

BimaLink is a comprehensive insurance platform designed for:
- **Agents**: Manage policies, track commissions, and grow their customer base
- **Customers**: Purchase insurance policies and track claims
- **Admins**: Monitor platform operations and generate reports

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS 3
- **UI Components**: Radix UI primitives
- **Forms**: React Hook Form
- **Data Fetching**: React Query (TanStack Query)
- **Charts**: Recharts
- **Routing**: React Router 6
- **Icons**: Lucide React
- **State Management**: React Context API
- **Testing**: Vitest
- **API**: Custom ApiService wrapper around Fetch API

## Project Structure

```
client/
├── pages/                        # Route components
│   ├── auth/                    # Authentication pages
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   └── VerifyOtp.tsx
│   ├── dashboard/               # Dashboard pages
│   │   ├── AgentDashboard.tsx
│   │   ├── CustomerDashboard.tsx
│   │   └── AdminDashboard.tsx
│   ├── Landing.tsx             # Landing/home page
│   ├── Placeholder.tsx         # Placeholder for future pages
│   ├── Unauthorized.tsx        # Unauthorized access page
│   └── NotFound.tsx            # 404 page
├── components/
│   ├── layouts/                # Layout components
│   │   └── MainLayout.tsx      # Primary layout with header/footer
│   ├── ui/                     # Radix UI components (pre-built)
│   ├── ProtectedRoute.tsx      # Route protection with role guards
│   └── ...
├── contexts/                    # React Context for global state
│   ├── AuthContext.tsx         # Authentication state
│   ├── ThemeContext.tsx        # Dark/light mode state
│   └── I18nContext.tsx         # Internationalization state
├── services/
│   └── api.ts                  # API service wrapper with all endpoints
├── utils/
│   └── theme.ts                # Theme utilities
├── i18n/                       # Internationalization files
│   ├── en.json                 # English translations
│   ├── fr.json                 # French translations
│   └── config.ts               # i18n configuration
├── App.tsx                     # Main app component with routing
├── global.css                  # Global styles and theme variables
└── README_FRONTEND.md          # This file
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
# or using pnpm (recommended)
pnpm install
```

### 2. Configure Environment

The application expects the backend API at `http://localhost:8080/api/v1`.

To change the API base URL, edit `client/services/api.ts`:
```typescript
const API_BASE_URL = 'http://localhost:8080/api/v1';
```

### 3. Run Development Server

```bash
npm run dev
# or
pnpm dev
```

The app will be available at `http://localhost:5173` (or the port Vite assigns).

### 4. Build for Production

```bash
npm run build
# or
pnpm build
```

## Configuration

### API Service

The `ApiService` class in `client/services/api.ts` is the central point for all API communication.

Example usage:
```typescript
import { apiService } from '@/services/api';

// Login
const response = await apiService.login({
  email: 'user@example.com',
  password: 'password123',
});

// Register
const registerResponse = await apiService.register({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  password: 'password123',
  role: 'agent',
});

// Get policies
const policiesResponse = await apiService.getPolicies();

// Initiate payment
const paymentResponse = await apiService.initiatePayment({
  amount: 500,
  method: 'mtn',
  phone: '+256700000000',
  policyId: 'policy_123',
});
```

### Authentication

Authentication is managed via `AuthContext` (`client/contexts/AuthContext.tsx`):

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  return (
    <>
      {isAuthenticated && <p>Welcome, {user?.firstName}!</p>}
    </>
  );
}
```

Auth token is stored in localStorage as `authToken` and automatically included in all API requests via the Authorization header.

### Theme (Dark/Light Mode)

Use the `useTheme` hook:

```typescript
import { useTheme } from '@/contexts/ThemeContext';

function MyComponent() {
  const { theme, toggleTheme } = useTheme();

  return <button onClick={toggleTheme}>Toggle Theme</button>;
}
```

The theme preference is persisted in localStorage and synced to the document element's `dark` class.

### Internationalization (i18n)

The app supports English and French. Use the `useI18n` hook:

```typescript
import { useI18n } from '@/contexts/I18nContext';

function MyComponent() {
  const { t, language, setLanguage } = useI18n();

  return (
    <>
      <h1>{t('common.appName')}</h1>
      <button onClick={() => setLanguage('fr')}>Français</button>
    </>
  );
}
```

### Route Protection

Protect routes with role-based access control:

```typescript
<ProtectedRoute requiredRoles={['agent', 'admin']}>
  <AgentComponent />
</ProtectedRoute>
```

## Features

### 1. Authentication
- **Login**: Email and password authentication with "Remember me" option
- **Registration**: Two-step registration with role selection (Agent/Customer)
- **OTP Verification**: Email-based OTP verification (2FA)
- **Token Management**: JWT tokens stored securely in localStorage

### 2. Role-Based Access
- **Agent Dashboard**: KPIs, policy management, commission tracking, customer management
- **Customer Dashboard**: Policy overview, claims tracking, payment history
- **Admin Dashboard**: Platform analytics, user management, revenue reports

### 3. Policy Management
- View all policies with filtering and pagination
- Create new policies
- Update existing policies
- Cancel policies
- Policy type support: Motor, Microinsurance, Health, Travel

### 4. Payment Processing
- Initiate payments via multiple methods (MTN, Airtel, Card)
- Track payment status in real-time
- Payment history and receipts
- Integration placeholders for payment gateways

### 5. Agent Features
- KYC document upload
- Commission tracking and earnings reports
- Customer management
- Policy creation and management
- Monthly performance metrics

### 6. Admin Features
- Real-time platform analytics
- User and agent management
- Policy distribution analysis
- Revenue reporting
- Export reports (CSV, PDF)
- Top agent performance leaderboard

### 7. Accessibility
- ARIA labels on all interactive elements
- Keyboard navigation support
- Semantic HTML
- High contrast support for dark mode
- Focus management in modals and dialogs

### 8. Internationalization
- **English** (en)
- **French** (fr)
- Language toggle in header
- Persisted language preference

### 9. Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)
- Touch-friendly interface
- Optimized for all screen sizes

## API Integration

### Base URL
```
http://localhost:8080/api/v1
```

### Authentication Headers
All authenticated requests include:
```
Authorization: Bearer <token>
Content-Type: application/json
```

### Error Handling
API responses follow this format:
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
```

## Required Backend Endpoints

### Authentication Endpoints

#### 1. Login
- **Endpoint**: `POST /auth/login`
- **Request**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "token": "jwt_token_here",
      "user": {
        "id": "user_123",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "agent",
        "avatar": "url_or_null"
      }
    }
  }
  ```

#### 2. Register
- **Endpoint**: `POST /auth/register`
- **Request**:
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "password": "password123",
    "role": "agent"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Registration successful. Please verify your email."
  }
  ```

#### 3. Verify OTP
- **Endpoint**: `POST /auth/verify-otp`
- **Request**:
  ```json
  {
    "email": "user@example.com",
    "code": "123456"
  }
  ```
- **Response**: Same as login response

#### 4. Resend OTP
- **Endpoint**: `POST /auth/resend-otp`
- **Request**:
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "OTP sent to email"
  }
  ```

#### 5. Logout
- **Endpoint**: `POST /auth/logout`
- **Auth Required**: Yes
- **Response**:
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```

### Agent Endpoints

#### 1. Get Agent Profile
- **Endpoint**: `GET /agents/profile`
- **Auth Required**: Yes
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "agent_123",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "commission": 12500,
      "totalPolicies": 45,
      "activeCustomers": 30,
      "kycStatus": "verified"
    }
  }
  ```

#### 2. Update Agent Profile
- **Endpoint**: `PUT /agents/profile`
- **Auth Required**: Yes
- **Request**: Partial agent object
- **Response**: Updated agent object

#### 3. Upload KYC Documents
- **Endpoint**: `POST /agents/kyc`
- **Auth Required**: Yes
- **Request**: FormData with document files
- **Response**:
  ```json
  {
    "success": true,
    "message": "KYC documents submitted for verification"
  }
  ```

#### 4. Get Agent Dashboard
- **Endpoint**: `GET /agents/dashboard`
- **Auth Required**: Yes
- **Response**: Agent profile with additional dashboard metrics

### Policy Endpoints

#### 1. Get All Policies
- **Endpoint**: `GET /policies`
- **Auth Required**: Yes
- **Query Parameters**: `?status=active&limit=10&offset=0`
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "policy_123",
        "type": "motor",
        "status": "active",
        "premium": 500,
        "startDate": "2024-01-01",
        "endDate": "2025-01-01",
        "coverageAmount": 50000,
        "description": "Comprehensive motor insurance"
      }
    ]
  }
  ```

#### 2. Get Single Policy
- **Endpoint**: `GET /policies/{id}`
- **Auth Required**: Yes
- **Response**: Single policy object (same structure as above)

#### 3. Create Policy
- **Endpoint**: `POST /policies`
- **Auth Required**: Yes
- **Request**: Policy object (without ID)
- **Response**: Created policy with ID

#### 4. Update Policy
- **Endpoint**: `PUT /policies/{id}`
- **Auth Required**: Yes
- **Request**: Partial policy object
- **Response**: Updated policy object

#### 5. Cancel Policy
- **Endpoint**: `POST /policies/{id}/cancel`
- **Auth Required**: Yes
- **Response**:
  ```json
  {
    "success": true,
    "message": "Policy cancelled successfully"
  }
  ```

### Payment Endpoints

#### 1. Initiate Payment
- **Endpoint**: `POST /payments/initiate`
- **Auth Required**: Yes
- **Request**:
  ```json
  {
    "amount": 500,
    "method": "mtn",
    "phone": "+256700000000",
    "policyId": "policy_123"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "transactionId": "txn_123",
      "reference": "REF123456",
      "status": "pending",
      "amount": 500,
      "timestamp": "2024-01-15T10:30:00Z"
    }
  }
  ```

#### 2. Get Payment Status
- **Endpoint**: `GET /payments/{transactionId}`
- **Auth Required**: Yes
- **Response**: Payment object with current status

#### 3. Get Payment History
- **Endpoint**: `GET /payments/history`
- **Auth Required**: Yes
- **Query Parameters**: `?limit=10&offset=0`
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "transactionId": "txn_123",
        "reference": "REF123456",
        "status": "success",
        "amount": 500,
        "timestamp": "2024-01-15T10:30:00Z"
      }
    ]
  }
  ```

### Admin Endpoints

#### 1. Get Reports
- **Endpoint**: `GET /admin/reports`
- **Auth Required**: Yes
- **Role Required**: admin
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "totalUsers": 1500,
      "totalAgents": 250,
      "totalPolicies": 3500,
      "totalRevenue": 1250000,
      "monthlyRevenue": 185000,
      "topAgents": [],
      "policyDistribution": {
        "motor": 1200,
        "microinsurance": 1500,
        "health": 600,
        "travel": 200
      }
    }
  }
  ```

#### 2. Export Reports
- **Endpoint**: `GET /admin/reports/export?format=csv`
- **Auth Required**: Yes
- **Role Required**: admin
- **Query Parameters**: `?format=csv|pdf`
- **Response**: Binary file (CSV or PDF)

### User Profile Endpoints

#### 1. Get User Profile
- **Endpoint**: `GET /users/profile`
- **Auth Required**: Yes
- **Response**: Complete user profile object

#### 2. Update User Profile
- **Endpoint**: `PUT /users/profile`
- **Auth Required**: Yes
- **Request**: Partial user object
- **Response**: Updated user object

#### 3. Change Password
- **Endpoint**: `POST /users/change-password`
- **Auth Required**: Yes
- **Request**:
  ```json
  {
    "currentPassword": "old_password",
    "newPassword": "new_password"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Password changed successfully"
  }
  ```

## Authentication Flow

1. **User lands on landing page** (`/`)
2. **User clicks "Register" or "Login"**
   - If registering: `POST /auth/register` → User redirected to `/verify-otp`
   - If logging in: `POST /auth/login` → JWT token stored in localStorage
3. **OTP Verification** (for new registrations)
   - `POST /auth/verify-otp` with email and OTP code
   - JWT token received and stored
4. **Token Storage**
   - Token automatically included in all subsequent requests
   - Stored in localStorage with key `authToken`
   - User data stored in localStorage with key `user`
5. **Protected Routes**
   - `ProtectedRoute` component checks for token and user role
   - Unauthorized users redirected to `/login`
   - Users without required role redirected to `/unauthorized`
6. **Logout**
   - `POST /auth/logout`
   - Token and user data cleared from localStorage
   - User redirected to `/login`

## Component Library

The application uses Radix UI components with custom TailwindCSS styling. Available components:

- Button
- Input
- Label
- Card
- Dialog
- Dropdown Menu
- Form
- Tabs
- Select
- Checkbox
- Radio Group
- Input OTP
- Alert
- Accordion
- And more...

All components are in `client/components/ui/` and can be imported as:
```typescript
import { Button } from '@/components/ui/button';
```

## Development Guidelines

### Adding a New Page

1. Create component in `client/pages/YourPage.tsx`
2. Add route in `client/App.tsx`
3. Wrap with `ProtectedRoute` if auth required
4. Wrap with `MainLayout` if navigation needed

### Adding API Endpoints

1. Add method to `ApiService` class in `client/services/api.ts`
2. Define request/response types
3. Use in components via `apiService.yourMethod()`

### Adding Translations

1. Add key/value pairs to `client/i18n/en.json` and `client/i18n/fr.json`
2. Use in components with `const { t } = useI18n(); t('key.path')`

### Form Development

All forms use React Hook Form with validation:

```typescript
import { useForm } from 'react-hook-form';

function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    // Submit data
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email', { required: true })} />
      {errors.email && <span>Email is required</span>}
    </form>
  );
}
```

## Testing

Run tests with:
```bash
npm run test
# or
pnpm test
```

## Production Build

```bash
npm run build
pnpm build
```

Output files will be in the `dist/` directory.

## Troubleshooting

### API Connection Issues
- Ensure backend is running at the configured URL
- Check CORS settings on backend
- Verify `API_BASE_URL` in `client/services/api.ts`

### Authentication Issues
- Check localStorage for `authToken` and `user` keys
- Verify token format and expiration
- Ensure backend returns JWT token in login response

### Styling Issues
- Clear browser cache
- Ensure TailwindCSS is built (should happen automatically)
- Check that dark mode class is applied to `<html>` element

### Translation Issues
- Verify keys exist in both `en.json` and `fr.json`
- Check for typos in translation keys
- Use fallback text if key not found

## Support

For issues or questions, contact the development team or file an issue in the repository.

## License

Proprietary - BimaLink Platform
