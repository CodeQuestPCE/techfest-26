# 👥 Role-Based Access Control (RBAC) - TechFest Platform

## Overview
This document defines the complete role-based feature access for the TechFest Event Management Platform.

---

## 1️⃣ PARTICIPANT (USER)

**Role**: `user`

### 🔐 Authentication
- ✅ User registration with email & password
- ✅ Login with JWT token
- ✅ Email verification support
- ✅ Referral code during signup
- ✅ Password reset functionality

### 🎯 Event Discovery & Registration
- ✅ Browse all published events
- ✅ View event details (category, venue, date, fee)
- ✅ Filter events by category, date, location
- ✅ Register for solo events
- ✅ Create teams for team events
- ✅ Add team members (validation: min/max team size)
- ✅ Automatic capacity validation

### 💳 Manual Payment Workflow
- ✅ View bank QR code & account details
- ✅ Make UPI payment (GPay/PhonePe/Paytm)
- ✅ Enter UTR/Transaction Reference Number
- ✅ Upload payment screenshot (JPG/PNG, max 2MB)
- ✅ File validation (type, size)
- ✅ Submit for admin verification

### 📊 Registration Status Tracking
- ✅ View all registrations
- ✅ Status indicators:
  - 🟡 **Pending** - Under verification
  - 🟢 **Verified** - Payment approved
  - 🔴 **Rejected** - Payment rejected with reason
- ✅ View rejection reason
- ✅ Email notifications on status change

### 🎟 Event Access & Participation
- ✅ QR code generated ONLY after verification
- ✅ View QR code on dashboard
- ✅ Download ticket with QR
- ✅ Use QR for venue entry

### 📄 Certificate
- ✅ Generate certificate after event
- ✅ Conditions:
  - Payment verified
  - Checked-in at event
- ✅ Download PDF certificate
- ✅ Email notification when ready

### API Endpoints
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/events
GET    /api/events/:id
POST   /api/registrations (with file upload)
GET    /api/registrations
GET    /api/tickets
POST   /api/certificates/generate/:registrationId
```

---

## 2️⃣ CAMPUS AMBASSADOR (CA)

**Role**: `ambassador`

### 🔐 Authentication
- ✅ Same login/signup as user
- ✅ Role assigned by admin
- ✅ Special dashboard access

### 🔗 Referral System
- ✅ Unique referral code generation
- ✅ Share code with students
- ✅ Track referred users
- ✅ Referral link generation

### ⭐ Point System (CRITICAL LOGIC)
- ✅ Points awarded **ONLY** when:
  - Referred user completes registration
  - Admin **verifies** payment (status: Pending → Verified)
- ✅ **No points** for:
  - Pending registrations
  - Rejected registrations
  - Cancelled registrations
- ✅ **10 points per verified referral**
- ✅ Prevents fake referral abuse

### 🏆 Leaderboard
- ✅ Real-time ranking
- ✅ Sorted by points (descending)
- ✅ Top 50 ambassadors displayed
- ✅ Public leaderboard view

### 📈 Performance Tracking
- ✅ Total referrals count
- ✅ Verified referrals count
- ✅ Total points earned
- ✅ Current rank
- ✅ Personal stats dashboard

### API Endpoints
```
POST   /api/ambassadors/generate-code
GET    /api/ambassadors/stats
GET    /api/ambassadors/leaderboard
```

---

## 3️⃣ EVENT COORDINATOR

**Role**: `coordinator`

### 🔐 Authentication
- ✅ Login with coordinator role
- ✅ Limited admin privileges
- ✅ Assigned to specific events

### 🎯 Event Operations
- ✅ View assigned events
- ✅ Access participant lists
- ✅ View team details
- ✅ Contact information access
- ✅ Event-specific analytics

### 🎟 On-Ground Support
- ✅ QR scanner access
- ✅ Check-in participants
- ✅ View check-in status
- ✅ Event day operations

### 📊 Analytics (Read-Only)
- ✅ Registration count per event
- ✅ Capacity utilization
- ✅ Check-in statistics
- ✅ Event reports

### API Endpoints
```
GET    /api/registrations/event/:eventId
GET    /api/checkin/stats/:eventId
POST   /api/checkin/validate
```

---

## 4️⃣ VOLUNTEER (ON-SITE STAFF)

**Role**: `coordinator` or `ambassador` (with check-in permission)

### 🔐 Authentication
- ✅ Restricted access
- ✅ Mobile-friendly interface
- ✅ Fast login

### 📷 QR Code Scanning
- ✅ Camera-based QR scanner
- ✅ Manual QR hash entry (fallback)
- ✅ Real-time backend verification
- ✅ Instant feedback

### 🚦 Entry Validation
- ✅ **Entry Allowed** if:
  - Registration status: Verified
  - QR hash is valid
  - Not already checked-in
- ✅ **Entry Denied** if:
  - Payment pending
  - Invalid QR code
  - Already checked-in
  - Registration rejected/cancelled

### ⚡ Fast Check-In
- ✅ One-click confirmation
- ✅ Optimized for mobile
- ✅ Minimal UI for speed
- ✅ Offline QR validation (optional)

### API Endpoints
```
POST   /api/checkin/validate
GET    /api/checkin/status/:qrHash
```

---

## 5️⃣ SYSTEM ADMIN / TREASURER

**Role**: `admin`

### 🔐 Full Access Control
- ✅ System-wide permissions
- ✅ All CRUD operations
- ✅ User role management
- ✅ Complete dashboard access

### 💳 Payment Verification (CORE FEATURE)
- ✅ View all **Pending** registrations
- ✅ Display UTR number
- ✅ View payment screenshot
- ✅ Match UTR with bank statement (manual)
- ✅ Approve payment → Verified
- ✅ Reject payment → Rejected
- ✅ Add rejection reason (required)
- ✅ Email notification trigger

### 🧾 Registration Management
- ✅ Approve registration workflow:
  1. Verify screenshot & UTR
  2. Change status to Verified
  3. Generate QR code
  4. Award ambassador points (if referred)
  5. Send approval email
  6. Log admin action
- ✅ Reject registration workflow:
  1. Enter rejection reason
  2. Change status to Rejected
  3. Restore ticket capacity
  4. Send rejection email
  5. Log admin action

### 🎟 QR & Ticket Control
- ✅ QR codes auto-generated on approval
- ✅ Unique QR hash per registration
- ✅ Enable venue access
- ✅ Ticket download management

### 📧 Notification System
- ✅ Email on registration submission (Pending)
- ✅ Email on approval (Verified)
- ✅ Email on rejection (with reason)
- ✅ Certificate ready notification
- ✅ Nodemailer integration

### 📊 Dashboard & Analytics
- ✅ Total registrations
- ✅ Pending vs Verified count
- ✅ Event-wise statistics
- ✅ Registration trends
- ✅ Revenue tracking (manual)
- ✅ Check-in statistics

### 🛡 Security & Audit
- ✅ View admin action logs
- ✅ Track who approved/rejected
- ✅ Timestamp all actions
- ✅ Prevent duplicate UTR usage
- ✅ User activity monitoring

### API Endpoints
```
GET    /api/admin/registrations/pending
GET    /api/admin/registrations
PUT    /api/admin/registrations/:id/approve
PUT    /api/admin/registrations/:id/reject
POST   /api/events (create)
PUT    /api/events/:id (update)
DELETE /api/events/:id (delete)
GET    /api/logs
GET    /api/logs/user/:userId
```

---

## 🔐 ROLE-PERMISSION MATRIX

| Feature | User | Ambassador | Coordinator | Volunteer | Admin |
|---------|------|------------|-------------|-----------|-------|
| **Authentication** |
| Register/Login | ✅ | ✅ | ✅ | ✅ | ✅ |
| Password Reset | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Events** |
| View Events | ✅ | ✅ | ✅ | ❌ | ✅ |
| Create Events | ❌ | ❌ | ✅ | ❌ | ✅ |
| Edit Events | ❌ | ❌ | ✅* | ❌ | ✅ |
| Delete Events | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Registration** |
| Register for Event | ✅ | ✅ | ❌ | ❌ | ❌ |
| Upload Payment | ✅ | ✅ | ❌ | ❌ | ❌ |
| View My Registrations | ✅ | ✅ | ❌ | ❌ | ✅ |
| Verify Payment | ❌ | ❌ | ❌ | ❌ | ✅ |
| View All Registrations | ❌ | ❌ | ✅** | ❌ | ✅ |
| **Check-in** |
| QR Scan | ❌ | ❌ | ✅ | ✅ | ✅ |
| Manual Check-in | ❌ | ❌ | ✅ | ❌ | ✅ |
| View Check-in Stats | ❌ | ❌ | ✅ | ❌ | ✅ |
| **Ambassador** |
| Generate Referral Code | ❌ | ✅ | ❌ | ❌ | ❌ |
| View Leaderboard | ✅ | ✅ | ✅ | ❌ | ✅ |
| View Personal Stats | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Certificate** |
| Generate Certificate | ✅*** | ✅*** | ❌ | ❌ | ✅ |
| Download Certificate | ✅ | ✅ | ❌ | ❌ | ✅ |
| **Admin** |
| Payment Verification | ❌ | ❌ | ❌ | ❌ | ✅ |
| View Admin Logs | ❌ | ❌ | ❌ | ❌ | ✅ |
| User Management | ❌ | ❌ | ❌ | ❌ | ✅ |

*\* Coordinator can edit only assigned events*  
*\*\* Coordinator can view only their event's registrations*  
*\*\*\* Only if payment verified AND checked-in*

---

## 🔒 Middleware Implementation

### Auth Middleware
```javascript
// Protect routes - requires valid JWT
app.use('/api/registrations', protect);

// Authorize specific roles
app.use('/api/admin', protect, authorize('admin'));
app.use('/api/checkin', protect, authorize('admin', 'coordinator', 'ambassador'));
```

### Rate Limiting
```javascript
// Login attempts
loginLimiter: 5 attempts per 15 minutes

// Registration
registrationLimiter: 5 registrations per 15 minutes

// General API
apiLimiter: 100 requests per 15 minutes
```

### File Upload Validation
```javascript
// Allowed: JPG, JPEG, PNG
// Max size: 2MB
// Storage: Local (uploads/) or Cloudinary
```

---

## 🎯 Business Rules

### Payment Verification
1. Admin views pending registration
2. Admin checks UTR in bank statement
3. Admin verifies screenshot matches amount
4. Admin approves OR rejects with reason
5. System triggers email notification
6. If approved: Generate QR code
7. If referred: Award points to ambassador

### Ambassador Points
- Points awarded ONLY on verification
- Formula: 10 points per verified referral
- No retroactive points
- Points cannot be transferred

### Certificate Generation
- Requires: Verified payment + Check-in
- Generated on-demand
- PDF format with event details
- Certificate ID = Registration ID

### QR Code Security
- Unique hash per registration
- Cannot be duplicated
- Validated in real-time
- One-time check-in only

---

## 📝 Notes for Viva/Presentation

### Why Manual Payment Verification?
- **Indian college context**: Most students use UPI
- **No payment gateway fees**: Saves 2-3% per transaction
- **Admin control**: Treasurer verifies all payments
- **Audit trail**: Complete payment history

### Why Points Only on Verification?
- **Prevents fraud**: Students can't fake referrals
- **Fair competition**: Only genuine referrals count
- **Admin oversight**: Treasurer controls point awards

### Security Features
- JWT tokens with expiry
- Rate limiting (prevents spam)
- File type/size validation
- MongoDB sanitization (prevents injection)
- Helmet (security headers)
- Unique UTR constraint (prevents duplication)

---

**Document Version**: 1.0  
**Last Updated**: January 3, 2026  
**Status**: Production Ready ✅
