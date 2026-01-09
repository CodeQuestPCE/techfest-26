# Event Management Platform

A comprehensive event management platform built with Next.js, Node.js, and MongoDB.

## Features

- 🎫 Event Creation & Management
- 👥 User Authentication & Authorization
- 🎟️ Ticket Booking & QR Code Generation
- 📅 Event Calendar & Search
- 📊 Admin Dashboard
- 💳 Payment Integration
- 📧 Email Notifications
- 📱 Responsive Design

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
