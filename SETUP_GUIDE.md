# TechFest Platform Setup Instructions

## Prerequisites

- Node.js 18+
- MongoDB 6+
- npm or yarn

## Backend Setup

### 1. Navigate to backend directory
```bash
cd backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create .env file
Copy `.env.example` to `.env` and configure:

```env
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/techfest_db

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Email Configuration (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password

# Stripe Payment (optional)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Frontend URL
FRONTEND_URL=http://localhost:3000

# File Upload
MAX_FILE_SIZE=2097152
UPLOAD_PATH=./uploads
```

### 4. Create necessary folders
```bash
mkdir uploads certificates
```

### 5. Start MongoDB
Make sure MongoDB is running on your system

### 6. Run backend server
```bash
npm run dev
```

Backend should now be running on http://localhost:5000

## Frontend Setup

### 1. Navigate to frontend directory
```bash
cd frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create .env.local file
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
```

### 4. Run frontend development server
```bash
npm run dev
```

Frontend should now be running on http://localhost:3000

## Features Implemented

### ✅ Backend Features
- JWT-based authentication with role-based access (user, admin, coordinator, ambassador)
- Manual payment verification system (UTR + screenshot upload)
- Admin dashboard for payment approval/rejection
- QR code generation on payment approval
- Check-in system with QR validation
- Campus Ambassador referral program with points
- Certificate generation (PDFKit)
- Email notifications for all status changes
- Security features (rate limiting, sanitization, helmet)
- Team-based event support

### ✅ Frontend Features
- Manual payment form with screenshot upload
- Admin verification dashboard
- QR code scanner for check-in
- Ambassador leaderboard
- User registration dashboard with QR codes
- Responsive design with Tailwind CSS

## User Roles

1. **User**: Regular attendee, can register for events
2. **Ambassador**: Campus ambassador with referral code
3. **Coordinator**: Can check-in attendees
4. **Admin**: Full access to verification dashboard

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user

### Events
- GET `/api/events` - Get all events
- POST `/api/events` - Create event (Admin/Coordinator)

### Registrations
- POST `/api/registrations` - Create registration with payment
- GET `/api/registrations` - Get user's registrations

### Admin
- GET `/api/admin/registrations/pending` - Get pending registrations
- PUT `/api/admin/registrations/:id/approve` - Approve registration
- PUT `/api/admin/registrations/:id/reject` - Reject registration

### Check-in
- POST `/api/checkin/validate` - Validate QR and check-in
- GET `/api/checkin/stats/:eventId` - Get event statistics

### Ambassadors
- GET `/api/ambassadors/leaderboard` - Get leaderboard
- GET `/api/ambassadors/stats` - Get personal stats
- POST `/api/ambassadors/generate-code` - Generate referral code

### Certificates
- POST `/api/certificates/generate/:registrationId` - Generate certificate
- GET `/api/certificates/download/:registrationId` - Download certificate

## Testing the System

### 1. Create Admin User
Use MongoDB Compass or CLI to set a user's role to 'admin'

### 2. Create an Event
Login as admin and create an event with team/solo configuration

### 3. Register as User
- Register with optional referral code
- Fill payment form with UTR and screenshot
- Status will be "Pending"

### 4. Admin Approval
- Login as admin
- Navigate to verification dashboard
- Approve/Reject registrations
- User receives email notification

### 5. QR Check-in
- Login as coordinator/admin
- Use QR scanner to validate tickets
- Mark attendance

### 6. Certificate Generation
- After check-in, users can generate certificates
- PDF certificate with event details

## Production Deployment

### Backend (Render/Railway/AWS)
```bash
npm run build
npm start
```

### Frontend (Vercel)
```bash
npm run build
```

Set environment variables in your hosting platform.

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check connection string in .env

### Email Not Sending
- Use app-specific password for Gmail
- Enable "Less secure app access" or use OAuth2

### File Upload Issues
- Check folder permissions for uploads/
- Verify MAX_FILE_SIZE setting

### QR Code Not Generating
- Ensure registration status is 'verified'
- Check qrCodeHash is being generated

## Support

For issues or questions, contact the development team.
