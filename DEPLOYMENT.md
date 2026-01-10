# 🚀 Deployment Guide - Render.com

**⚠️ Important Update**: Due to dynamic admin routes, this app requires **TWO separate services** on Render (both free tier):
1. **Backend Service** (API)
2. **Frontend Service** (Next.js)

Both services will fit within the free tier (750 hours/month) thanks to auto-sleep.

---

## 📋 Prerequisites

✅ Code pushed to GitHub repository: `CodeQuestPCE/techfest-26`
✅ MongoDB Atlas connection string ready
✅ Render.com account created

---

## 🎯 Deployment Steps

### Part 1: Deploy Backend API

#### Step 1: Create Backend Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `CodeQuestPCE/techfest-26`

#### Step 2: Configure Backend Service

**Basic Settings:**
- **Name**: `eventhub-api`
- **Region**: Singapore (or closest to your users)
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: Node
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Instance Type**: Free

#### Step 3: Backend Environment Variables

```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://pcodequest_db_user:77bMpfvwdLVvvX6I@cluster0.kqofxwn.mongodb.net/eventhub?retryWrites=true&w=majority
JWT_SECRET=7ca5f9fad10e2f7ed457314381df59d165488d12a98ae423629326f6ac349846ce9b3ac82684f53a2e3cb9499c7a8bf47f1aa5333f330abe4c41f0f1e48b5fb7
JWT_EXPIRE=30d
```

Wait for it to deploy, then **copy the backend URL** (e.g., `https://eventhub-api.onrender.com`)

---

### Part 2: Deploy Frontend

#### Step 4: Create Frontend Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect same repository: `CodeQuestPCE/techfest-26`

#### Step 5: Configure Frontend Service

**Basic Settings:**
- **Name**: `eventhub-frontend`
- **Region**: Singapore (same as backend)
- **Branch**: `main`
- **Root Directory**: `frontend`
- **Runtime**: Node
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Instance Type**: Free

#### Step 6: Frontend Environment Variables

```
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://eventhub-api.onrender.com/api
```

**⚠️ Replace** `eventhub-api.onrender.com` with your actual backend URL from Step 3!

---

### Part 3: Update Backend CORS

#### Step 7: Add Frontend URL to Backend

1. Go back to **Backend Service** → **Environment** tab
2. Add new variable:
   ```
   FRONTEND_URL=https://eventhub-frontend.onrender.com
   ```
3. **Replace** with your actual frontend URL
4. Service will auto-redeploy

---

### Step 8: Verify MongoDB Network Access

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Click **"Network Access"** (left sidebar)
3. Ensure `0.0.0.0/0` is in IP Access List
4. If not: **"Add IP Address"** → **"Allow Access from Anywhere"**

---

## ✅ Testing Your Deployment

**Frontend URL**: `https://eventhub-frontend.onrender.com`

**Test Checklist:**
- ✅ Homepage loads
- ✅ Login/Register works
- ✅ Events display
- ✅ Registration system works
- ✅ Admin panel accessible
- ✅ QR scanner works

---

## 🔍 Troubleshooting

### View Logs:
Dashboard → Your Service → **Logs** tab

### Common Issues:

**1. API requests failing:**
- Verify `NEXT_PUBLIC_API_URL` points to backend URL with `/api`
- Check backend CORS includes frontend URL
- Ensure MongoDB connection is working

**2. First load is slow:**
- Normal! Free tier sleeps after 15min
- First request takes ~30-60 seconds
- Keep services alive with uptime monitors (optional)

**3. CORS errors:**
- Verify `FRONTEND_URL` in backend matches your frontend URL
- Check browser console for specific errors

---

## 💰 Free Tier Resources

**Per Service:**
- 750 hours/month (shared across all free services)
- 512MB RAM
- Auto-sleep after 15min inactivity
- 100GB bandwidth/month

**Two Services Total:**
- Still fits in free tier with auto-sleep
- ~375 hours each if evenly distributed
- More than enough for college events

---

## 🎉 Success!

**Frontend**: `https://eventhub-frontend.onrender.com`
**Backend**: `https://eventhub-api.onrender.com`

Both services are live and connected!
