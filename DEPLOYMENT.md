# 🚀 Single Service Deployment Guide - Render.com

This guide will help you deploy both frontend and backend as a **single service** on Render.com (Free Tier).

## 📋 Prerequisites

✅ Code pushed to GitHub repository: `CodeQuestPCE/techfest-26`
✅ MongoDB Atlas connection string ready
✅ Render.com account created

---

## 🎯 Deployment Steps

### Step 1: Create Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `CodeQuestPCE/techfest-26`
4. Configure the service:

#### Basic Settings:
- **Name**: `eventhub` (or your preferred name)
- **Region**: Singapore (or closest to your users)
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: Node
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

#### Instance Type:
- **Free** (512MB RAM, auto-sleeps after 15min inactivity)

### Step 2: Configure Environment Variables

Click **"Environment"** tab and add these variables:

```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://pcodequest_db_user:77bMpfvwdLVvvX6I@cluster0.kqofxwn.mongodb.net/eventhub?retryWrites=true&w=majority
JWT_SECRET=your_super_secure_jwt_secret_key_12345
JWT_EXPIRE=30d
```

**⚠️ Important**: Generate a strong JWT_SECRET using:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

After deployment, add:
```
FRONTEND_URL=https://your-app-name.onrender.com
```

### Step 3: Deploy

1. Click **"Create Web Service"**
2. Wait for build to complete (5-10 minutes for first deployment)
3. Once deployed, you'll get a URL like: `https://eventhub.onrender.com`

### Step 4: Update FRONTEND_URL

1. Go to your service's **Environment** variables
2. Add/Update: `FRONTEND_URL=https://your-actual-url.onrender.com`
3. Service will auto-redeploy

### Step 5: Verify MongoDB Network Access

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Click **"Network Access"** (left sidebar)
3. Ensure `0.0.0.0/0` is in the IP Access List
4. If not, click **"Add IP Address"** → **"Allow Access from Anywhere"**

---

## ✅ Testing Your Deployment

Visit your Render URL: `https://your-app.onrender.com`

**Test Checklist:**
- ✅ Homepage loads correctly
- ✅ Login/Register works
- ✅ Events display properly
- ✅ Registration system functions
- ✅ Admin panel accessible
- ✅ QR code scanner works

---

## 🔍 Monitoring & Troubleshooting

### View Logs:
1. Go to Render Dashboard → Your Service
2. Click **"Logs"** tab
3. Check for errors during startup or runtime

### Common Issues:

#### 1. Service not starting:
- Check build logs for errors
- Verify all environment variables are set
- Ensure MongoDB URI is correct

#### 2. Frontend not loading:
- Check if build completed successfully
- Verify `frontend/out` directory was created
- Check browser console for errors

#### 3. API requests failing:
- Ensure API routes start with `/api/`
- Check CORS configuration
- Verify MongoDB connection

#### 4. First request is slow:
- Normal! Free tier services sleep after 15min inactivity
- First request wakes the service (takes ~30-60 seconds)
- Subsequent requests are fast

---

## 🎨 What Changed for Single Service?

### Frontend (Next.js):
✅ Configured for static export (`output: 'export'`)
✅ API calls use relative paths (`/api`)
✅ Images use `unoptimized: true`
✅ Builds to `frontend/out` directory

### Backend (Express):
✅ Serves static files from `frontend/out`
✅ Handles client-side routing
✅ All API routes prefixed with `/api/`
✅ Build script includes frontend build

---

## 💰 Free Tier Limits

- **Hours**: 750 hours/month per account (one service = plenty of headroom)
- **RAM**: 512MB
- **Auto-sleep**: After 15 minutes of inactivity
- **Wake time**: ~30-60 seconds on first request
- **Bandwidth**: 100GB/month
- **Build time**: 500 hours/month

**Pro Tip**: Free tier is perfect for:
- Development/testing
- Low-traffic applications
- College events (moderate traffic)

---

## 🔐 Security Checklist

- ✅ Strong JWT_SECRET generated
- ✅ MongoDB Atlas network access configured
- ✅ Environment variables set (never commit `.env`)
- ✅ CORS configured with production URL
- ✅ HTTPS enabled (automatic on Render)

---

## 📞 Need Help?

**Render Logs**: Dashboard → Service → Logs
**MongoDB Logs**: Atlas Dashboard → Database → Monitoring
**GitHub**: Check your repository for code issues

---

## 🎉 Congratulations!

Your EventHub application is now live on: `https://your-app.onrender.com`

**Note**: First request after sleep takes ~30-60 seconds. Keep this in mind when sharing the link!
