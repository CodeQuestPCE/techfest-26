# 🚀 QUICK START GUIDE - EventHub TechFest Platform

## ✅ COMPLETE PROJECT SETUP (5 MINUTES)

**Project Repository**: [github.com/CodeQuestPCE/techfest-26](https://github.com/CodeQuestPCE/techfest-26)

**Status**: Production Ready - Fully responsive for mobile, tablet, and desktop 📱💻

---

## 📋 Prerequisites Check

- ✅ Node.js 18+ installed
- ✅ MongoDB 6+ installed and running
- ✅ Git installed
- ✅ VS Code (recommended)

---

## 🔧 STEP 1: Install Dependencies

### Backend Setup
```powershell
cd backend
npm install
```

### Frontend Setup
```powershell
cd frontend
npm install
```

---

## 🔐 STEP 2: Environment Configuration

### Backend (.env file already exists)

Edit `backend/.env` with your details:

```env
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/techfest_db

# JWT
JWT_SECRET=techfest_super_secret_key_2026_change_in_production
JWT_EXPIRE=7d

# Email Configuration (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your.email@gmail.com
EMAIL_PASSWORD=your_app_password

# Frontend URL
FRONTEND_URL=http://localhost:3000

# File Upload
MAX_FILE_SIZE=2097152
UPLOAD_PATH=./uploads
```

### Frontend (.env.local)

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 📧 STEP 3: Gmail Setup (For Email Notifications)

1. Go to Google Account Settings
2. Enable **2-Factor Authentication**
3. Generate **App Password**:
   - Account → Security → 2-Step Verification → App passwords
   - Select "Mail" and "Windows Computer"
   - Copy the 16-character password
4. Paste in `EMAIL_PASSWORD` in backend/.env

---

## 🗄️ STEP 4: Database Setup

### Start MongoDB (if not running)
```powershell
# Windows
mongod

# OR if using MongoDB Compass
# Just open Compass and connect to localhost:27017
```

### Create Database
MongoDB will auto-create `techfest_db` on first connection.

---

## 🏃 STEP 5: Run the Application

### Terminal 1 - Backend Server
```powershell
cd backend
npm run dev
```

**Expected Output:**
```
Server running on port 5000
MongoDB Connected: localhost
```

### Terminal 2 - Frontend Server
```powershell
cd frontend
npm run dev
```

**Expected Output:**
```
✓ Ready on http://localhost:3000
```

---

## 🎯 STEP 6: Create Admin User

### Option A: Using MongoDB Compass

1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. Select `techfest_db` database
4. Create collection: `users`
5. Insert document:

```json
{
  "name": "Admin User",
  "email": "admin@techfest.com",
  "password": "$2a$10$YourHashedPasswordHere",
  "college": "PCE Purnea",
  "phone": "1234567890",
  "role": "admin",
  "points": 0,
  "isEmailVerified": true,
  "createdAt": { "$date": "2026-01-03T00:00:00.000Z" },
  "updatedAt": { "$date": "2026-01-03T00:00:00.000Z" }
}
```

### Option B: Using API (Register then manually change role)

1. Register at `http://localhost:3000/register`
2. In MongoDB, find your user
3. Change `role` field to `"admin"`

### Option C: Quick Script

Create `backend/createAdmin.js`:

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI);

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  college: String,
  phone: String,
  role: String,
  points: Number,
  isEmailVerified: Boolean
});

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await User.create({
    name: 'System Admin',
    email: 'admin@techfest.com',
    password: hashedPassword,
    college: 'PCE Purnea',
    phone: '9876543210',
    role: 'admin',
    points: 0,
    isEmailVerified: true
  });
  
  console.log('Admin created:', admin);
  process.exit(0);
}

createAdmin();
```

Run:
```powershell
cd backend
node createAdmin.js
```

**Login Credentials:**
- Email: `admin@techfest.com`
- Password: `admin123`

---

## 🧪 STEP 7: Test the Application

### 1. User Registration
- Go to `http://localhost:3000/register`
- Create a test user account

### 2. Create an Event (as Admin)
- Login as admin
- Navigate to admin panel
- Create a test event

### 3. Register for Event
- Login as regular user
- View events
- Register with payment details (use fake UTR for testing)

### 4. Verify Payment (as Admin)
- Login as admin
- Go to verification dashboard
- Approve the registration

### 5. Check QR Code
- Login as user
- View "My Registrations"
- QR code should now be visible

---

## 📁 Project Structure Verification

```
techfest/
├── backend/
│   ├── src/
│   │   ├── config/         ✅
│   │   ├── controllers/    ✅
│   │   ├── middleware/     ✅
│   │   ├── models/         ✅
│   │   ├── routes/         ✅
│   │   ├── utils/          ✅
│   │   └── server.js       ✅
│   ├── uploads/            ✅ (created)
│   ├── certificates/       ✅ (created)
│   ├── .env                ✅
│   └── package.json        ✅
│
├── frontend/
│   ├── src/
│   │   ├── app/            ✅
│   │   ├── components/     ✅
│   │   ├── lib/            ✅
│   │   ├── services/       ✅
│   │   ├── store/          ✅
│   │   └── types/          ✅
│   ├── .env.local          ⚠️ (create this)
│   └── package.json        ✅
│
└── Documentation/
    ├── README.md           ✅
    ├── SETUP_GUIDE.md      ✅
    ├── ROLE_BASED_FEATURES.md  ✅
    ├── VIVA_GUIDE.md       ✅
    └── PROJECT_STATUS.md   ✅
```

---

## 🐛 Troubleshooting

### Backend won't start
```powershell
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Kill process if needed
taskkill /PID <process_id> /F
```

### MongoDB connection error
```powershell
# Start MongoDB service
net start MongoDB

# OR check if MongoDB is running
tasklist | findstr mongod
```

### Email not sending
- Check Gmail app password is correct
- Ensure 2FA is enabled on Google account
- Check firewall settings

### Frontend API errors
- Verify `NEXT_PUBLIC_API_URL` is set to `http://localhost:5000/api`
- Check backend is running
- Clear browser cache

---

## 🎯 API Testing (Optional)

### Using Postman/Thunder Client

#### 1. Register User
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "college": "PCE Purnea",
  "phone": "9876543210"
}
```

#### 2. Login
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

Copy the `token` from response.

#### 3. Get Events
```
GET http://localhost:5000/api/events
Authorization: Bearer <your_token>
```

---

## 📊 Success Indicators

✅ Backend server running on port 5000  
✅ Frontend accessible at http://localhost:3000  
✅ MongoDB connected successfully  
✅ Can register new users  
✅ Can login and get JWT token  
✅ Can create events (as admin)  
✅ Can register for events  
✅ Can upload payment screenshots  
✅ Admin can verify payments  
✅ QR codes generated after verification  

---

## 🚀 Production Deployment (Optional)

### Backend (Render/Railway)
1. Create account on Render.com
2. Connect GitHub repository
3. Set environment variables
4. Deploy

### Frontend (Vercel)
1. Create account on Vercel.com
2. Import GitHub repository
3. Set environment variables
4. Deploy

### Database (MongoDB Atlas)
1. Create free cluster on MongoDB Atlas
2. Get connection string
3. Update `MONGODB_URI` in production

---

## 📞 Support

**Project Status:** ✅ 100% Complete  
**All Features Implemented:** 35+ API endpoints  
**Documentation:** Complete  

**Need help?** Check:
- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Detailed setup
- [ROLE_BASED_FEATURES.md](ROLE_BASED_FEATURES.md) - Feature list
- [VIVA_GUIDE.md](VIVA_GUIDE.md) - Exam preparation

---

**Last Updated:** January 3, 2026  
**Version:** 1.0.0  
**Status:** Production Ready 🎉
