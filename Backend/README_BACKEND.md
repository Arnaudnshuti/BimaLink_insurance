# BimaLink Backend API

A complete Spring Boot 3.x backend for BimaLink insurance platform with JWT authentication, role-based access control, OTP 2FA, and mobile money payment integration.

## Features

- **Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (ADMIN, AGENT, CUSTOMER)
  - Email OTP 2-factor authentication
  - Password encryption with BCrypt

- **Core Functionality**
  - Agent and customer management
  - Policy lifecycle management
  - Commission calculation and tracking
  - Transaction processing
  - Mobile money payment integration (sandbox)

- **Database**
  - PostgreSQL
  - Flyway migrations
  - Optimized indexes

- **Security**
  - CORS enabled for frontend (http://localhost:4200)
  - JWT token validation
  - Role-based endpoint protection
  - Payment callback signature validation (TODO)

## Prerequisites

- Java 17+
- Maven 3.6+
- PostgreSQL 12+
- (Optional) Docker for containerized deployment

## Environment Variables

Create a `.env` file in the project root or set these environment variables:

```bash
# Database Configuration
DB_HOST=localhost
DB_NAME=bimalink
DB_USER=postgres
DB_PASS=postgres

# JWT Secret (CHANGE IN PRODUCTION!)
JWT_SECRET=your-very-secure-secret-key-here-min-32-characters

# Payment Provider (sandbox)
PAYMENT_PROVIDER_API_KEY=your-api-key-here
PAYMENT_PROVIDER_CALLBACK_SECRET=your-callback-secret-here
```

## Database Setup

1. Create PostgreSQL database:
```sql
CREATE DATABASE bimalink;
```

2. Flyway will automatically run migrations on startup. The initial migration creates:
   - `users` - User authentication
   - `agents` - Agent profiles
   - `customers` - Customer profiles
   - `policies` - Insurance policies
   - `transactions` - Payment transactions
   - `commissions` - Agent commissions
   - `user_otps` - OTP storage

## Building and Running

### Development Mode

```bash
# Build the project
mvn clean package

# Run the application
mvn spring-boot:run
```

Or run with environment variables:

```bash
DB_HOST=localhost DB_NAME=bimalink DB_USER=postgres DB_PASS=postgres JWT_SECRET=my-secret mvn spring-boot:run
```

### Production Mode

```bash
# Build JAR
mvn clean package -DskipTests

# Run JAR with environment variables
java -jar target/bimalink-0.0.1-SNAPSHOT.jar \
  --spring.datasource.url=jdbc:postgresql://localhost:5432/bimalink \
  --spring.datasource.username=postgres \
  --spring.datasource.password=postgres \
  --app.jwt.secret=your-secret-here
```

## API Endpoints

### Authentication (`/api/v1/auth`)

- `POST /api/v1/auth/register-agent` - Register new agent
  ```json
  {
    "username": "agent1",
    "email": "agent@example.com",
    "password": "SecurePass123",
    "fullName": "John Doe",
    "phone": "+1234567890"
  }
  ```

- `POST /api/v1/auth/verify-otp` - Verify OTP code
  ```json
  {
    "email": "agent@example.com",
    "otp": "123456"
  }
  ```

- `POST /api/v1/auth/resend-otp` - Resend OTP
  ```json
  {
    "email": "agent@example.com"
  }
  ```

- `POST /api/v1/auth/login` - Login
  ```json
  {
    "email": "agent@example.com",
    "password": "SecurePass123"
  }
  ```

### Payments (`/api/v1/payments`)

- `POST /api/v1/payments/initiate` - Initiate payment
  - Requires authentication
  - Body:
    ```json
    {
      "policyId": 1,
      "amount": 1000.00,
      "paymentMethod": "MOBILE_MONEY",
      "phone": "+1234567890"
    }
    ```

- `POST /api/v1/payments/callback` - Payment provider callback (public endpoint)
  - Receives payment status from provider
  - TODO: Implement signature validation

### Reports (`/api/v1/reports`)

- `GET /api/v1/reports/daily` - Daily policy summary
  - Requires ADMIN role
  - Returns: policy count and total premiums for today

### Agents (`/api/v1/agents`)

- `GET /api/v1/agents/{id}/performance` - Get agent performance metrics
  - Requires ADMIN role
  - Returns: total policies sold, commissions, premiums

## Testing

### Run All Tests

```bash
mvn test
```

### Run Specific Test Class

```bash
mvn test -Dtest=CommissionServiceTest
```

### Test Coverage

```bash
# Install jacoco plugin first
mvn clean test jacoco:report
```

## Swagger/API Documentation

TODO: Add SpringDoc OpenAPI/Swagger dependency for interactive API documentation.

Once added, documentation will be available at:
- Swagger UI: http://localhost:8080/swagger-ui.html
- API Docs: http://localhost:8080/v3/api-docs

## Security Considerations

### TODO: Critical Security Items

1. **Payment Provider Integration**
   - [ ] Implement HMAC signature validation in `PaymentProviderClient.validateCallbackSignature()`
   - [ ] Add API key authentication for payment provider
   - [ ] Implement rate limiting for payment endpoints

2. **Email Service**
   - [ ] Integrate with actual email provider (SendGrid, AWS SES, etc.)
   - [ ] Configure SMTP credentials
   - [ ] Add email templates

3. **Production Deployment**
   - [ ] Use strong JWT secret (min 32 characters)
   - [ ] Enable HTTPS
   - [ ] Configure CORS origins for production frontend
   - [ ] Set up database connection pooling
   - [ ] Enable database SSL/TLS
   - [ ] Configure proper logging levels
   - [ ] Set up monitoring and alerting

4. **Secrets Management**
   - [ ] Move secrets to environment variables or secrets manager
   - [ ] Never commit secrets to version control
   - [ ] Use Vault or AWS Secrets Manager for production

## Project Structure

```
src/main/java/Backend/bimalink/
├── config/          # Security and configuration
├── controller/      # REST controllers
├── dto/            # Data transfer objects
├── entity/         # JPA entities
├── exception/      # Exception handlers
├── filter/         # JWT filter
├── repository/     # Data repositories
└── service/        # Business logic

src/main/resources/
├── application.yml # Application configuration
└── db/migration/   # Flyway migrations

src/test/java/     # Unit and integration tests
```

## Common Issues

### Database Connection Failed

Check PostgreSQL is running:
```bash
# Windows
net start postgresql-x64-12

# Linux/Mac
sudo systemctl start postgresql
```

### Flyway Migration Fails

If schema is out of sync:
```bash
# Reset database (WARNING: Deletes all data)
DROP DATABASE bimalink;
CREATE DATABASE bimalink;
```

### JWT Token Issues

- Ensure `JWT_SECRET` environment variable is set
- Token expires after 24 hours (configured in `application.yml`)
- Include `Authorization: Bearer <token>` header in requests

## Contributing

1. Follow Java coding conventions
2. Add unit tests for new services
3. Update documentation for API changes
4. Run `mvn clean test` before committing

## License

Copyright © 2024 BimaLink

---

**Note**: This is a development version. Do not use in production without implementing all security TODOs.
