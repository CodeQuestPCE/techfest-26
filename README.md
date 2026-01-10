# TechFest - Event Management Platform

A comprehensive event management platform for organizing technical festivals and college events.

## ✨ Features

- Event creation and management
- User authentication with role-based access
- QR code based registration and check-in
- Event search and filtering
- Admin dashboard for management
- Payment verification system
- Ambassador referral program
- Email notifications
- Responsive design for all devices
- Secure with modern security practices

## 👥 User Roles & Permissions

EventHub supports four distinct user roles, each with specific permissions and capabilities:

### 1. **Regular User (Student)** 👤
- Browse and search all published events
- Register for events (solo or team)
- View personal dashboard with registrations
- Upload payment screenshots
- Download QR codes after verification
- Track registration status
- View event details and venue information
- **Default role** for all new sign-ups

### 2. **Ambassador** 🌟
- All Regular User permissions
- Generate and share unique referral codes
- Track referral points and leaderboard ranking
- View referral statistics
- Access ambassador-specific dashboard
- Earn points for successful referrals
- Compete for rewards based on performance

### 3. **Coordinator** 📋
- All Regular User permissions
- Create and manage events
- Edit event details (title, description, dates, fees)
- Set event capacity and registration limits
- Configure team size for team events
- Scan QR codes for event check-ins
- View registrations for their events
- Publish/unpublish events

### 4. **Admin** 🛡️
- **Full system access** with all permissions
- User management (view, edit roles, delete)
- Event management (create, edit, delete all events)
- Payment verification and management
- View and manage all registrations
- Access analytics dashboard with platform statistics
- Monitor activity logs
- Configure global payment settings (UPI ID, QR code)
- QR code scanning for all events
- View comprehensive reports and metrics
- System-wide configuration access

## Technology

**Frontend:** Next.js, React, TypeScript, Tailwind CSS  
**Backend:** Node.js, Express, MongoDB  
**Security:** JWT, bcrypt, rate limiting, input validation, XSS protection, CSRF protection

## Project Structure

```
├── frontend/          # Next.js frontend application
├── backend/           # Express.js backend API
├── shared/            # Shared types and utilities
└── docs/              # Documentation
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Local Development Setup

1. **Clone the repository:**
```bash
git clone https://github.com/CodeQuestPCE/techfest-26.git
cd techfest-26
```

2. **Backend Setup:**
```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your MongoDB URI and other configs
```

3. **Frontend Setup:**
```bash
cd ../frontend
npm install

# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local
```

4. **Start Development Servers:**
```bash
# Backend (Terminal 1)
cd backend
npm run dev

# Frontend (Terminal 2)  
cd frontend
npm run dev
```

5. **Create Admin Account:**
```bash
cd backend
node resetAdmin.js
```

6. **Access Application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Health Check: http://localhost:5000/api/health

### Production Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions on Render.com

**Quick Summary:**
- Deploy backend and frontend as separate services on Render
- Configure environment variables on each service
- Both services fit in free tier with auto-sleep
- Admin created manually via script

**Live Demo:**
- Frontend: https://techfestpce.onrender.com
- Backend API: https://techfest-26-tgyb.onrender.com/api

*