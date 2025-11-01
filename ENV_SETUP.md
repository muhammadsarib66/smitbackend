# HealthMate Backend - Environment Setup Guide

## Required Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/healthmate
# For MongoDB Atlas, use: mongodb+srv://username:password@cluster.mongodb.net/healthmate

# JWT Secret Key (Change this to a secure random string in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Gemini AI Configuration
GEMINI_API_KEY=AIzaSyD_2kn_tBisudyKEdFSQaqLomCDCJ_cqCI
GEMINI_MODEL=gemini-1.5-flash

# Email Configuration (for password reset)
MAIL_SERVICE=gmail
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

## Quick Setup Steps

1. Copy the content above and create a `.env` file in the project root
2. Update `MONGODB_URI` with your MongoDB connection string
3. Update `JWT_SECRET` with a secure random string
4. Update email credentials if you want to use password reset functionality
5. The Gemini API key is already configured

## Installation

```bash
npm install
```

## Running the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## Testing

Import the `HealthMate_API_Collection.postman_collection.json` file into Postman to test all endpoints.

