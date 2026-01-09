# 🚀 Deployment Guide - Production Checklist

## Pre-Deployment Checklist

### 1. Environment Configuration

#### Backend (.env for production)
```env
# Server
PORT=5000
NODE_ENV=production

# Database - Use MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/event_management?retryWrites=true&w=majority

# JWT - Already configured with strong secret
JWT_SECRET=4299ee532bca1068fb961cb319003d0430ead26200fcc752ed63cbed31b7ae31ab3fef7b467a22132023df0e63b2398d15f849585e119f9cd710af06c76549f1
JWT_EXPIRE=7d

# Email - Use your production SMTP
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-production-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password

# Frontend URL - Your production domain
FRONTEND_URL=https://yourdomain.com

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

#### Frontend (.env.local for production)
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_BASE_URL=https://api.yourdomain.com
```

### 2. Update CORS in server.js

```javascript
// Replace localhost with your production domains
app.use(cors({
  origin: [
    'https://yourdomain.com',
    'https://www.yourdomain.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 3. Database Setup (MongoDB Atlas)

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create new cluster (free tier available)
3. Create database user with strong password
4. Whitelist IP addresses (or 0.0.0.0/0 for all - less secure)
5. Get connection string
6. Update MONGODB_URI in .env

### 4. File Storage

**Option A: Local Storage (Simple)**
- Create `uploads/` and `certificates/` directories on server
- Ensure proper permissions (chmod 755)

**Option B: Cloud Storage (Recommended)**
- AWS S3
- Cloudinary
- Google Cloud Storage

Update upload paths in .env accordingly.

---

## Deployment Options

### Option 1: Railway (Recommended for Node.js)

**Backend Deployment:**
```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Initialize project
cd backend
railway init

# 4. Add environment variables in Railway dashboard
railway variables set NODE_ENV=production
railway variables set MONGODB_URI=your_mongodb_uri
railway variables set JWT_SECRET=your_secret
# ... add all other variables

# 5. Deploy
railway up
```

**Frontend Deployment:**
```bash
cd frontend
railway init
railway variables set NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
railway up
```

### Option 2: Vercel (Best for Next.js)

**Frontend:**
```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy frontend
cd frontend
vercel

# 3. Add environment variables in Vercel dashboard
# Go to Settings > Environment Variables
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
NEXT_PUBLIC_BASE_URL=https://your-backend-url.com
```

**Backend:** Deploy on Railway/Heroku/DigitalOcean

### Option 3: VPS (Full Control)

**Requirements:**
- Ubuntu 20.04+ server
- Node.js 18+
- MongoDB installed or Atlas
- Nginx (web server)
- SSL certificate (Let's Encrypt)

**Setup Steps:**
```bash
# 1. SSH into server
ssh user@your-server-ip

# 2. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install PM2 (process manager)
sudo npm install -g pm2

# 4. Clone your repository
git clone https://github.com/yourusername/your-repo.git
cd your-repo

# 5. Install dependencies
cd backend && npm install
cd ../frontend && npm install && npm run build

# 6. Set up environment variables
cd ../backend
nano .env
# Paste your production environment variables

# 7. Start backend with PM2
pm2 start src/server.js --name event-backend
pm2 save
pm2 startup

# 8. Start frontend
cd ../frontend
pm2 start npm --name "event-frontend" -- start
```

**Nginx Configuration:**
```nginx
# /etc/nginx/sites-available/event-management
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**SSL Certificate (Let's Encrypt):**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## Post-Deployment

### 1. Create Admin Account
```bash
# SSH into server or use Railway/Vercel CLI
cd backend
node createAdmin.js
```

### 2. Test Everything
- [ ] User registration works
- [ ] Login works
- [ ] Event creation works
- [ ] Payment upload works
- [ ] QR scanner works
- [ ] Email notifications work
- [ ] All images load
- [ ] Mobile responsive

### 3. Monitoring Setup

**PM2 Monitoring (if using VPS):**
```bash
pm2 monit
pm2 logs
```

**Error Tracking:**
```bash
npm install @sentry/node
```

Add to server.js:
```javascript
const Sentry = require("@sentry/node");
Sentry.init({ dsn: "your-sentry-dsn" });
```

### 4. Backups

**Database Backup (MongoDB Atlas):**
- Enable automated backups in Atlas dashboard
- Set up daily snapshots

**Manual Backup:**
```bash
mongodump --uri="mongodb+srv://username:password@cluster.mongodb.net/event_management"
```

**Restore:**
```bash
mongorestore --uri="mongodb+srv://username:password@cluster.mongodb.net/event_management" dump/
```

---

## Maintenance

### Regular Tasks
- [ ] Update dependencies monthly: `npm update`
- [ ] Check security vulnerabilities: `npm audit`
- [ ] Monitor server logs
- [ ] Review database size
- [ ] Check SSL certificate expiry
- [ ] Test backups

### Performance Optimization
```bash
# Enable compression
npm install compression

# In server.js
const compression = require('compression');
app.use(compression());
```

---

## Troubleshooting

### Common Issues:

**1. CORS Errors:**
- Check FRONTEND_URL in backend .env
- Verify origin in cors() configuration
- Check browser console for exact error

**2. Database Connection Fails:**
- Verify MONGODB_URI is correct
- Check IP whitelist in MongoDB Atlas
- Ensure database user has correct permissions

**3. Images Not Loading:**
- Check NEXT_PUBLIC_BASE_URL
- Verify CORS headers on /uploads route
- Ensure uploads directory exists

**4. JWT Errors:**
- Verify JWT_SECRET matches between requests
- Check token expiry (JWT_EXPIRE)
- Clear browser localStorage

**5. Rate Limiting Too Strict:**
- Adjust limits in rateLimiter.js
- Consider IP whitelist for testing

---

## Rollback Plan

**If deployment fails:**
```bash
# Railway
railway rollback

# Vercel
vercel rollback

# VPS with PM2
pm2 restart event-backend
pm2 restart event-frontend
```

**Restore database:**
```bash
mongorestore --uri="mongodb+srv://..." --drop dump/
```

---

## Cost Estimates

### Free Tier Options:
- **MongoDB Atlas**: 512MB free
- **Railway**: $5/month credit
- **Vercel**: Free for personal projects
- **Render**: Free with limitations

### Paid Options:
- **DigitalOcean**: $5-10/month VPS
- **AWS Lightsail**: $5/month
- **MongoDB Atlas**: $9/month (M2)
- **Cloudinary**: $0.25/GB storage

---

## Support & Resources

- Backend URL: Check Railway/Vercel dashboard
- Frontend URL: Your production domain
- Database: MongoDB Atlas dashboard
- Logs: PM2/Railway/Vercel logs
- SSL: Let's Encrypt auto-renewal

---

**✅ You're ready to deploy!** Follow these steps carefully and your application will be live and secure.
