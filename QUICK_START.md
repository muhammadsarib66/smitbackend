# Quick Start Guide - HealthMate Backend

## Step 1: Environment Setup

The `.env` file has been created with your Gemini API key. You need to:

1. **Update MongoDB URI**:
   - Local: `mongodb://localhost:27017/healthmate`
   - Atlas: `mongodb+srv://username:password@cluster.mongodb.net/healthmate`

2. **Update JWT Secret**:
   - Change `JWT_SECRET` to a secure random string

3. **Update Email (Optional)**:
   - Only needed if you want password reset functionality

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Start MongoDB

Make sure MongoDB is running on your system.

## Step 4: Start the Server

```bash
npm run dev
```

Server will start on `http://localhost:5000`

## Step 5: Test with Postman

1. Import `HealthMate_API_Collection.postman_collection.json` into Postman
2. Base URL is already set to `http://localhost:5000/api`
3. Start with Authentication:
   - Admin Signup or Admin Login
   - User Signup or User Login
   - Token will be automatically saved after login

## Testing Workflow

1. **Login** → Get token (auto-saved)
2. **Dashboard** → View stats
3. **Reports** → Upload file or create manual report
4. **Vitals** → Add vital entries
5. **Chat** → Ask AI questions
6. **Timeline** → View reports/vitals timeline

## Important Notes

- Gemini API key is already configured
- All endpoints require authentication (except login/signup)
- File uploads support JPG, PNG, PDF (max 10MB)
- AI analysis happens automatically on report upload/create
- Chat history is maintained per user

## Troubleshooting

- **MongoDB Connection Error**: Check if MongoDB is running
- **Gemini API Error**: Verify API key is correct in `.env`
- **File Upload Error**: Check file size and format
- **Authentication Error**: Make sure token is sent in Authorization header

