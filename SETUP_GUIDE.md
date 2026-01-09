# TechFest Platform Setup Guide

Quick setup instructions for the event management platform.

## Prerequisites

- Node.js 18+
- MongoDB
- npm

## Installation Steps

### Backend

1. Install dependencies:
```bash
cd backend
npm install
```

2. Configure `.env` file in the backend directory:

**Backend `.env` Template:**
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/eventhub

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30

# Email Configuration (Gmail Example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
EMAIL_FROM=EventHub <noreply@eventhub.com>

# Frontend URL (for CORS and email links)
FRONTEND_URL=http://localhost:3000

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# Payment Configuration (Optional)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Security
BCRYPT_ROUNDS=10
```

**Important Notes:**
- Change `JWT_SECRET` to a random secure string in production
- For Gmail, enable 2FA and create an [App Password](https://myaccount.google.com/apppasswords)
- Never commit `.env` file to version control
- Copy from `.env.example` if available

3. Start backend:
```bash
npm start
```

### Frontend

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Configure `.env.local` file in the frontend directory:

**Frontend `.env.local` Template:**
```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Base URL for uploads/images
NEXT_PUBLIC_BASE_URL=http://localhost:5000

# Environment
NEXT_PUBLIC_ENV=development

# Optional: Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

**Important Notes:**
- All frontend environment variables must start with `NEXT_PUBLIC_` to be accessible in the browser
- `NEXT_PUBLIC_API_URL` should point to your backend API
- `NEXT_PUBLIC_BASE_URL` is used for image/file URLs
- Copy from `.env.example` if available

3. Start frontend:
```bash
npm run dev
```

## Access

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Features

- User authentication with JWT
- Event creation and management
- Registration with payment verification
- QR code generation and check-in
- Admin dashboard
- Email notifications
- Ambassador referral system
- Certificate generation

## User Roles

- **User**: Regular attendee
- **Ambassador**: Referral program member
- **Coordinator**: Can check-in attendees
- **Admin**: Full management access

## Testing

1. Create admin user via MongoDB
2. Create events as admin
3. Register as user with payment details
4. Approve registrations as admin
5. Check-in using QR codes
6. Generate certificates

For detailed API documentation, see backend route files.
