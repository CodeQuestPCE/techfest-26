# EventHub - College TechFest Management Platform

A comprehensive, production-ready event management platform built with Next.js, Node.js, and MongoDB. **Fully responsive for mobile, tablet, and desktop devices.**

## ✨ Key Features

- 🎫 **Event Creation & Management** - Create, edit, and manage technical festival events
- 👥 **User Authentication & Authorization** - Role-based access (Admin, Coordinator, Ambassador, User)
- 🎟️ **QR Code Registration System** - Automated QR code generation with check-in functionality
- 📅 **Event Search & Filtering** - Advanced search with category filters
- 📊 **Admin Dashboard** - Payment verification, registration management, analytics
- 💳 **Payment Integration** - UPI payment with screenshot upload and manual verification
- 🎯 **Ambassador Program** - Referral system with leaderboard and rewards
- 📧 **Email Notifications** - Automated confirmation and update emails
- 📱 **Fully Responsive Design** - Mobile-first design with hamburger navigation
- 🔒 **Security Hardened** - JWT authentication, input validation, rate limiting, CORS protection

## Tech Stack

### Frontend
- Next.js 14 (React 18)
- TypeScript
- Tailwind CSS
- Zustand (State Management)
- React Query
- Axios

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Bcrypt
- Multer (File Upload)

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
- MongoDB 6+
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd event-management-platform
```

2. Install dependencies
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. Set up environment variables
```bash
# Copy environment templates
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

4. Configure your environment variables in the `.env` files

5. Start MongoDB

6. Run the development servers
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000)

## API Documentation

API documentation is available at `/api/docs` when running the backend server.

## License

MIT
