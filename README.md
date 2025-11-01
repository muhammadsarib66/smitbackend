# HealthMate Backend - Sehat ka Smart Dost

A comprehensive backend system for personal health management with AI-powered report analysis using Google Gemini API.

## Features

- **User Authentication** - Secure JWT-based authentication with password reset
- **Dashboard** - Comprehensive health statistics and insights
- **Medical Reports** - Upload and analyze medical reports with Gemini AI
- **Vitals Tracking** - Track BP, Sugar, Weight, Pulse, Temperature
- **AI Chat Assistant** - Interactive health consultation via Gemini AI
- **Timeline View** - Chronological view of all health activities

## Tech Stack

- Node.js & Express.js
- MongoDB with Mongoose
- JWT Authentication
- Multer for file uploads
- Google Gemini AI for report analysis
- Nodemailer for email services

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (see ENV_SETUP.md for details)

4. Start the server:
```bash
npm run dev
```

## Environment Variables

Required environment variables (see `.env` file):
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `GEMINI_API_KEY` - Google Gemini API key
- `GEMINI_MODEL` - Gemini model name (default: gemini-1.5-flash)
- `MAIL_SERVICE`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASSWORD` - Email configuration

## API Endpoints

### Authentication
- `POST /api/admin/signup` - Admin signup
- `POST /api/admin/login` - Admin login
- `POST /api/user/signup` - User signup
- `POST /api/user/login` - User login
- `POST /api/user/forgot-password` - Send password reset OTP
- `POST /api/user/verify-otp` - Verify OTP
- `POST /api/user/reset-password` - Reset password

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### Reports
- `POST /api/reports/upload` - Upload report file (with Gemini AI analysis)
- `POST /api/reports/manual` - Create manual report (with Gemini AI analysis)
- `GET /api/reports` - Get all reports (with filters: reportType, date)
- `GET /api/reports/:id` - Get report by ID
- `GET /api/reports/timeline` - Get reports timeline (with date range)
- `GET /api/reports/:id/download` - Download report file
- `DELETE /api/reports/:id` - Delete report

### Vitals
- `POST /api/vitals` - Add vital entry
- `GET /api/vitals` - Get all vitals (with filter: date)
- `GET /api/vitals/:id` - Get vital by ID
- `PUT /api/vitals/:id` - Update vital entry
- `DELETE /api/vitals/:id` - Delete vital entry
- `GET /api/vitals/timeline` - Get vitals timeline (with date range)

### Chat (AI Assistant)
- `POST /api/chat/message` - Send message to AI assistant
- `GET /api/chat/history` - Get chat history
- `DELETE /api/chat/history` - Clear chat history

## Testing with Postman

1. Import `HealthMate_API_Collection.postman_collection.json` into Postman
2. Set the `baseUrl` variable to your server URL (default: http://localhost:5000/api)
3. Login using Admin/User Login endpoints - the token will be automatically saved
4. Test all other endpoints - they will use the saved token automatically

## Project Structure

```
smitBackend/
├── src/
│   ├── controllers/     # Request handlers
│   │   ├── DashboardController.js
│   │   ├── ReportController.js
│   │   ├── VitalController.js
│   │   ├── ChatController.js
│   │   └── UserController.js
│   ├── models/          # MongoDB models
│   │   ├── User.model.js
│   │   ├── Report.model.js
│   │   ├── Vital.model.js
│   │   └── Chat.model.js
│   ├── routes/          # API routes
│   │   ├── auth.js
│   │   ├── dashboard.js
│   │   ├── report.js
│   │   ├── vital.js
│   │   └── chat.js
│   ├── middleware/      # Custom middleware
│   │   ├── middleware.js
│   │   └── multer.js
│   ├── utils/           # Utility functions
│   │   ├── geminiService.js
│   │   └── transporter.js
│   └── db/              # Database connection
│       └── db.js
├── uploads/             # Uploaded files
│   └── reports/         # Medical reports
├── .env                 # Environment variables
├── server.js            # Main server file
└── package.json         # Dependencies
```

## Report Types

Supported report types:
- `CBC` - Complete Blood Count
- `X-Ray` - X-Ray Reports
- `Ultrasound` - Ultrasound Reports
- `Blood Test` - Blood Test Reports
- `Other` - Other medical reports

## File Upload

- Supported formats: JPG, PNG, PDF
- Maximum file size: 10MB
- Files are stored in `uploads/reports/` directory
- Files are automatically analyzed by Gemini AI on upload

## AI Features

### Report Analysis
- Automatic extraction of medical data from images/PDFs
- Summary generation in English
- Abnormal value detection
- Doctor questions suggestions

### Chat Assistant
- Health-related Q&A
- Context-aware conversations
- Personalized health advice
- Medical disclaimer included

## Security

- JWT-based authentication
- Password hashing with bcrypt
- File validation and sanitization
- User-specific data access control
- Environment variables for sensitive data

## License

MIT
