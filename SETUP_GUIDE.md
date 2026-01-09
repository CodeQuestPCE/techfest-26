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

2. Configure `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/eventdb
JWT_SECRET=your_secret_key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
FRONTEND_URL=http://localhost:3000
```

# Stripe Payment (optional)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Frontend URL
FRONTEND_URL=http://localhost:3000

```

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

2. Configure `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

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
