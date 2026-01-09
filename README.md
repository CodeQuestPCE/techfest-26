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
- NQuick Start

### Prerequisites
- Node.js 18+
- MongoDB
- npm

### Setup

1. Install dependencies:
```bash
cd backend && npm install
cd ../frontend && npm install
```

2. Configure environment variables in `backend/.env`

3. Start servers:
```bash
# Backend (Terminal 1)
cd backend && npm start

# Frontend (Terminal 2)
cd frontend && npm run dev
```

4. Access at http://localhost:3000