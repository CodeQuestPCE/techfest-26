# 🔒 Security Guide for Event Management System

## ✅ Implemented Security Measures

### 1. Authentication & Authorization
- **Password Hashing**: Bcrypt with 10 salt rounds
- **JWT Tokens**: Secure token-based authentication with 7-day expiry
- **Role-Based Access Control (RBAC)**: 
  - `user` - Regular event participants
  - `admin` - Full system access
  - `coordinator` - Event management
  - `ambassador` - Referral program access

### 2. Rate Limiting (DDoS Protection)
- **Login**: 5 attempts per 15 minutes per IP
- **Registration**: 5 attempts per 15 minutes per IP
- **General API**: 100 requests per 15 minutes per IP

### 3. Input Validation & Sanitization
- **express-mongo-sanitize**: Prevents NoSQL injection attacks
- **express-validator**: Input validation on all routes
- **Input length limits**: Prevents buffer overflow attacks
  - Name: 100 chars
  - Email: 100 chars
  - Password: 128 chars max
  - Description: 5000 chars
  - And more...

### 4. Security Headers (Helmet.js)
- **X-Content-Type-Options**: nosniff
- **X-Frame-Options**: DENY (prevents clickjacking)
- **X-XSS-Protection**: 1; mode=block
- **Content-Security-Policy**: Restricts resource loading
- **HSTS**: HTTP Strict Transport Security (for production)

### 5. File Upload Security
- **Allowed types**: JPG, JPEG, PNG only
- **File size limit**: 2MB maximum
- **Random filenames**: Crypto.randomBytes() prevents filename attacks
- **Secure storage**: Files stored outside web root

### 6. CORS Configuration
- **Restricted origins**: Only localhost:3000 and localhost:3001
- **Credentials**: Properly configured
- **Methods**: Explicitly listed (GET, POST, PUT, DELETE, PATCH)

---

## 🚨 CRITICAL - Before Deployment

### 1. Environment Variables
**NEVER commit `.env` files to version control!**

Your `.gitignore` now includes:
```
.env
.env.local
.env.production
uploads/
certificates/
```

### 2. Update JWT Secret (✅ DONE)
Strong 512-bit secret has been generated and set in `.env`

### 3. Production Environment Variables
Update for production:
```env
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
```

### 4. HTTPS/SSL Certificate
- **Never run production without HTTPS**
- Use Let's Encrypt (free) or commercial SSL
- Redirect all HTTP to HTTPS

### 5. Database Security
```javascript
// MongoDB connection with security options
const connectDB = async () => {
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    authSource: 'admin',
    ssl: true, // Enable in production
    sslValidate: true
  };
  await mongoose.connect(process.env.MONGODB_URI, options);
};
```

### 6. Update CORS for Production
```javascript
// In server.js
app.use(cors({
  origin: ['https://yourdomain.com', 'https://www.yourdomain.com'],
  credentials: true
}));
```

---

## 🛡️ Additional Security Recommendations

### 1. Session Management
**Current limitation**: JWT tokens valid until expiry even after logout

**Future improvement**:
- Implement refresh tokens
- Add token blacklist for logout
- Use Redis for session storage

### 2. Two-Factor Authentication (2FA)
Consider adding for admin accounts:
```bash
npm install speakeasy qrcode
```

### 3. Security Monitoring
Log all security events:
- Failed login attempts
- Unauthorized access attempts
- Unusual file uploads
- Rate limit violations

### 4. Regular Security Audits
```bash
# Check for vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Manual review
npm audit fix --force
```

### 5. Dependency Management
```bash
# Keep dependencies updated
npm outdated
npm update

# Use exact versions in production
npm shrinkwrap
```

---

## 🔍 Security Checklist for Deployment

- [ ] HTTPS enabled with valid SSL certificate
- [ ] Environment variables set in production (not in code)
- [ ] Database has authentication enabled
- [ ] MongoDB connection uses SSL
- [ ] CORS configured for production domain
- [ ] Rate limiting enabled
- [ ] File upload limits enforced
- [ ] Admin password is strong (16+ characters)
- [ ] Error messages don't expose sensitive info
- [ ] Security headers enabled (Helmet.js)
- [ ] .gitignore includes .env and sensitive files
- [ ] Backups automated and tested
- [ ] Logs are monitored for security events
- [ ] npm audit shows no vulnerabilities

---

## 🚀 Secure Deployment Steps

### 1. Use Environment Variables in Hosting
**Vercel/Netlify/Railway:**
- Set env vars in dashboard (never in code)
- Use secrets management features

### 2. MongoDB Atlas Security
```
1. Enable IP Whitelist
2. Use strong database password
3. Enable database encryption
4. Set up automated backups
5. Enable database auditing
```

### 3. Server Hardening
```bash
# Disable unnecessary services
# Keep OS updated
# Use firewall (ufw/iptables)
# Disable root SSH access
# Use SSH keys instead of passwords
```

### 4. Monitoring & Alerts
- Set up error tracking (Sentry)
- Monitor server resources
- Track failed login attempts
- Alert on security events

---

## 🔐 Password Policy

### User Passwords
- Minimum 6 characters (consider increasing to 8+)
- No maximum length restriction
- Bcrypt hashing with salt

### Admin Passwords (Recommended)
- Minimum 16 characters
- Mix of uppercase, lowercase, numbers, symbols
- Change every 90 days
- Never reuse passwords

---

## 📝 Security Incident Response

### If Security Breach Occurs:

1. **Immediate Actions**:
   - Take system offline
   - Revoke all JWT tokens
   - Reset all passwords
   - Check access logs

2. **Investigation**:
   - Identify entry point
   - Check database for unauthorized changes
   - Review file uploads
   - Analyze logs

3. **Recovery**:
   - Patch vulnerability
   - Restore from clean backup
   - Notify affected users
   - Document incident

4. **Prevention**:
   - Update security measures
   - Add monitoring
   - Conduct security audit

---

## 📞 Security Contacts

Keep list of:
- Hosting provider support
- Database provider support
- Security researcher contact
- Legal/compliance team

---

## 🧪 Security Testing

### Manual Testing
- [ ] Test with invalid inputs
- [ ] Try SQL/NoSQL injection
- [ ] Test XSS vulnerabilities
- [ ] Try unauthorized access
- [ ] Test file upload attacks
- [ ] Check password strength enforcement

### Automated Testing
```bash
# Install security testing tools
npm install --save-dev jest supertest

# Run security tests
npm test
```

---

## ✅ Current Security Status

### Fixed Issues:
✅ .gitignore files created (prevents .env exposure)
✅ Strong JWT secret generated (512-bit)
✅ Input validation middleware added
✅ Input length limits enforced
✅ CORS restricted to specific origins
✅ Rate limiting on all API endpoints
✅ Password hashing with bcrypt
✅ File upload restrictions
✅ Security headers with Helmet.js
✅ NoSQL injection prevention

### Production Ready With:
- HTTPS configuration
- Production environment variables
- MongoDB Atlas with authentication
- Domain-specific CORS settings
- Error logging and monitoring

---

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/administration/security-checklist/)

---

## 🎯 Summary

Your application now has:
- ✅ Strong authentication & authorization
- ✅ Input validation & sanitization  
- ✅ Rate limiting & DDoS protection
- ✅ Secure file uploads
- ✅ Security headers
- ✅ Environment variable protection

**Ready for deployment after configuring production settings!** 🚀
