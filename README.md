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

## Technology

**Frontend:** Next.js, React, TypeScript, Tailwind CSS  
**Backend:** Node.js, Express, MongoDB  
**Security:** JWT, bcrypt, rate limiting, input validation

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