# EventHub - Complete Setup Guide

Event management platform for PCE Purnea TechFest 2026

---

## 📋 Prerequisites

- Node.js 18+
- MongoDB (local) or MongoDB Atlas (production)
- npm or yarn
- Git

---

## 🔧 Local Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/CodeQuestPCE/techfest-26.git
cd techfest-26
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/event_management
JWT_SECRET=your_local_jwt_secret_key
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

Start backend:
```bash
npm run dev
```

Backend runs on: **http://localhost:5000**

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start frontend:
```bash
npm run dev
```

Frontend runs on: **http://localhost:3000**

### 4. Create Admin Account (Local)

```bash
cd backend
node createAdmin.js
```

**Default Admin:**
- Email: `admin@techfest.com`
- Password: `admin123`

---

## 🌐 Production Deployment (Render)

### Prerequisites

1. MongoDB Atlas account with connection string
2. Render.com account (free tier)
3. Code pushed to GitHub

### Step 1: Deploy Backend Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. **New +** → **Web Service**
3. Connect repository: `CodeQuestPCE/techfest-26`

**Configuration:**
- Name: `eventhub-api`
- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`
- Instance Type: **Free**

**Environment Variables:**
```env
NODE_ENV=production
PORT=10000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=generate_secure_random_string
JWT_EXPIRE=30d
```

**Generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy backend URL after deployment: `https://your-api.onrender.com`

### Step 2: Deploy Frontend Service

1. **New +** → **Web Service**
2. Connect same repository

**Configuration:**
- Name: `eventhub-frontend`
- Root Directory: `frontend`
- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Instance Type: **Free**

**Environment Variables:**
```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-api.onrender.com/api
```

### Step 3: Update Backend CORS

Add to backend environment variables:
```env
FRONTEND_URL=https://your-frontend.onrender.com
```

### Step 4: Configure MongoDB Atlas

1. Go to MongoDB Atlas dashboard
2. Navigate to **Network Access**
3. Add IP: `0.0.0.0/0` (Allow from anywhere)

### Step 5: Create Admin Account (Production)

Run locally with production database:

```bash
cd backend
node resetAdmin.js
```

This creates:
- Email: `pcodequest@gmail.com`
- Password: `admin@#pce`

**Note:** Edit `resetAdmin.js` to customize admin credentials before running.

---

## 🎯 Common Commands

### Development
```bash
# Backend
cd backend && npm run dev

# Frontend  
cd frontend && npm run dev
```

### Production Scripts
```bash
# Create/Reset Admin
node backend/resetAdmin.js

# Create Default Admin
node backend/createAdmin.js
```

### Git Workflow
```bash
git add .
git commit -m "Your message"
git push origin main
```

---

## 📂 Project Structure

```
techfest-26/
├── backend/                # Express.js API
│   ├── src/
│   │   ├── config/        # Database config
│   │   ├── models/        # MongoDB models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Auth & validation
│   │   └── server.js      # Entry point
│   ├── createAdmin.js     # Default admin script
│   ├── resetAdmin.js      # Custom admin script
│   └── package.json
│
├── frontend/              # Next.js 14 App
│   ├── src/
│   │   ├── app/          # App router pages
│   │   ├── components/   # React components
│   │   ├── services/     # API services
│   │   └── store/        # Zustand store
│   ├── next.config.js
│   └── package.json
│
├── DEPLOYMENT.md          # Deployment guide
└── SETUP_GUIDE.md        # This file
```

---

## 🎨 Features

- ✅ JWT authentication & authorization
- ✅ Event creation & management
- ✅ Solo & team registrations
- ✅ Payment verification
- ✅ QR code tickets
- ✅ Admin dashboard
- ✅ Scanner for check-ins
- ✅ Analytics & reports
- ✅ Ambassador program
- ✅ Certificate generation

---

## 👥 User Roles

- **User**: Register for events, view tickets
- **Ambassador**: Referral tracking, commission
- **Coordinator**: Scan QR codes, check-in attendees
- **Admin**: Full access to all features

---

## 🛠️ Troubleshooting

### Backend Issues

**MongoDB Connection Failed:**
- Verify MONGODB_URI is correct
- Check network access in MongoDB Atlas
- Ensure MongoDB is running (local)

**Port Already in Use:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**Trust Proxy Error:**
- Already fixed in code with `app.set('trust proxy', 1)`

### Frontend Issues

**API Connection Failed:**
- Verify backend is running
- Check NEXT_PUBLIC_API_URL
- Verify CORS is configured

**CORS Errors:**
- Add FRONTEND_URL to backend environment
- Restart backend service

**Build Errors:**
```bash
rm -rf node_modules .next
npm install
```

### Deployment Issues

**Render Build Failed:**
- Check logs in Render dashboard
- Verify environment variables
- Ensure correct root directory

**Rate Limiting Errors:**
- Fixed with trust proxy setting
- Allow X-Forwarded-For header

---

## 🔐 Security Notes

- ✅ `.env` files are gitignored
- ✅ Sensitive data removed from public files
- ✅ JWT secrets properly generated
- ✅ MongoDB Atlas network access configured
- ✅ CORS properly configured
- ✅ Rate limiting enabled

---

## 📞 Support

**Documentation:**
- [DEPLOYMENT.md](DEPLOYMENT.md) - Detailed deployment guide

**Live URLs:**
- Frontend: https://techfestpce.onrender.com
- Backend: https://techfest-26-tgyb.onrender.com

**Admin Access:**
- Email: `pcodequest@gmail.com`
- Password: `admin@#pce`

---

## 📄 License

MIT License - PCE Purnea TechFest 2026
