# Setup Guide for smit Backend

## Quick Start

### 1. Environment Setup

Create a `.env` file in the root directory with the following content:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/smitBackend

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 2. Database Setup

#### Option A: Local MongoDB
1. Install MongoDB on your system
2. Start MongoDB service
3. Create database: `smitBackend`

#### Option B: MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a cluster
3. Get connection string and update `MONGODB_URI` in `.env`

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Server

#### Development Mode (with auto-reload)
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

### 5. Verify Installation

Visit `http://localhost:5000/health` to check if the server is running.

## API Testing

### Using Postman or Similar Tool

1. **Admin Signup**
   ```
   POST http://localhost:5000/api/admin/signup
   Content-Type: application/json
   
   {
     "email": "admin@example.com",
     "firstName": "John",
     "firstName": "Doe",
     "phoneNumber": "+1234567890",
     "password": "securepassword123"
   }
   ```

2. **Admin Login**
   ```
   POST http://localhost:5000/api/admin/login
   Content-Type: application/json
   
   {
     "email": "admin@example.com",
     "password": "securepassword123"
   }
   ```

3. **User Signup**
   ```
   POST http://localhost:5000/api/user/signup
   Content-Type: application/json
   
   {
     "email": "user@example.com",
     "firstName": "Jane",
     "lastName": "Smith",
     "phoneNumber": "+0987654321",
     "password": "userpassword123"
   }
   ```

### Using cURL

```bash
# Admin signup
curl -X POST http://localhost:5000/api/admin/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "password": "securepassword123"
  }'

# Admin login
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "securepassword123"
  }'
```

## File Upload Testing

### Profile Picture Upload

```bash
# Using cURL with file upload
curl -X PUT http://localhost:5000/api/admin/user/USER_ID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "profileImg=@/path/to/image.jpg" \
  -F "firstName=Updated" \
  -F "lastName=Name"
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check if MongoDB is running
   - Verify connection string in `.env`
   - Ensure network access (for Atlas)

2. **Port Already in Use**
   - Change PORT in `.env`
   - Kill process using the port: `lsof -ti:5000 | xargs kill -9`

3. **JWT Token Issues**
   - Check JWT_SECRET in `.env`
   - Ensure token is sent as `Bearer <token>`

4. **File Upload Issues**
   - Check `uploads/` directory exists
   - Verify file size (max 5MB)
   - Ensure file is an image

### Logs

Check console output for detailed error messages and debugging information.

## Security Notes

- **Never commit `.env` file** to version control
- **Change JWT_SECRET** in production
- **Use HTTPS** in production
- **Implement rate limiting** for production use
- **Regular security updates** for dependencies

## Next Steps

1. Implement input validation middleware
2. Add password reset functionality
3. Implement email verification
4. Add role-based access control
5. Implement audit logging
6. Add API documentation with Swagger
7. Set up CI/CD pipeline
8. Implement monitoring and health checks
