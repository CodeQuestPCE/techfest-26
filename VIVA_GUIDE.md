# 🎓 VIVA PREPARATION GUIDE - TechFest Platform

## Quick Overview
**Project**: Event Management Platform for College TechFest  
**Stack**: MERN (MongoDB, Express.js, React, Node.js)  
**Architecture**: Monolithic Backend + React Frontend  
**Key Innovation**: Manual Payment Verification System

---

## 🔥 TOP 20 VIVA QUESTIONS & ANSWERS

### 1. What is the main purpose of this project?
**Answer**: This is an event management platform for college technical festivals. It allows students to register for events using manual payment verification (UPI/bank transfer), implements a campus ambassador referral system, and provides QR-based check-in at events.

### 2. Why did you use manual payment verification instead of a payment gateway?
**Answer**: 
- **Cost-effective**: Avoids 2-3% payment gateway fees
- **Indian college context**: Students primarily use UPI (GPay/PhonePe)
- **Admin control**: Treasurer manually verifies all payments
- **Audit trail**: Complete payment history with screenshots
- **Security**: UTR numbers prevent duplicate payments

### 3. Explain the payment verification workflow.
**Answer**:
1. Student makes UPI payment
2. Student uploads UTR number + screenshot
3. Registration status = **Pending**
4. Admin views pending registrations
5. Admin matches UTR with bank statement
6. Admin **Approves** → QR code generated, email sent
7. OR Admin **Rejects** → reason provided, email sent

### 4. How does the Campus Ambassador system work?
**Answer**:
- Ambassadors get unique referral codes
- Students use code during signup
- Ambassador's points increase ONLY when referred student's payment is **verified** by admin
- This prevents fake referrals
- Leaderboard shows top ambassadors

### 5. Why are points awarded only on verification, not registration?
**Answer**: To prevent fraud. If points were given immediately, ambassadors could create fake accounts and registrations. By awarding points only after admin verification, we ensure only genuine, paid registrations count.

### 6. Explain the QR code check-in system.
**Answer**:
- QR code generated ONLY after payment verification
- Contains unique hash linked to registration
- Volunteers scan QR at event venue
- Backend validates registration status
- Marks check-in status as true
- Prevents re-entry (one-time check-in)

### 7. What are the different user roles?
**Answer**:
1. **User**: Register, pay, attend events
2. **Ambassador**: Referral codes, earn points, leaderboard
3. **Coordinator**: View event registrations, check-in access
4. **Volunteer**: QR scanner only
5. **Admin**: Payment verification, full access

### 8. How is security implemented?
**Answer**:
- **JWT tokens** for authentication
- **Rate limiting** (5 login attempts per 15 min)
- **File validation** (only JPG/PNG, max 2MB)
- **MongoDB sanitization** (prevents injection attacks)
- **Helmet.js** (security headers)
- **Unique UTR constraint** (prevents duplicate payments)
- **bcrypt** for password hashing

### 9. What database schema did you design?
**Answer**:
- **User**: name, email, password, college, role, referralCode, points
- **Event**: title, category, eventType (solo/team), minTeamSize, maxTeamSize, venue, capacity
- **Registration**: user, event, teamName, utrNumber, paymentScreenshot, status (pending/verified/rejected), qrCodeHash
- **Ticket**: registrationId, qrCode, status
- **NotificationLog**: admin action audit trail

### 10. How do you handle team events?
**Answer**:
- Event has `eventType` field (solo/team)
- Team events have `minTeamSize` and `maxTeamSize`
- Registration includes `teamName` and `teamMembers` array
- Validation: team size must be within min/max range
- All team members linked to same registration

### 11. What happens if a registration is rejected?
**Answer**:
1. Admin provides rejection reason
2. Status changed to "Rejected"
3. Email sent to user with reason
4. Ticket capacity restored
5. User can re-register with correct details

### 12. How is email notification handled?
**Answer**:
- **Nodemailer** for email service
- Emails sent on:
  - Registration submission (Pending)
  - Payment approval (Verified)
  - Payment rejection (with reason)
  - Certificate ready
- No queues (direct async/await)

### 13. How do you generate certificates?
**Answer**:
- **PDFKit** library for PDF generation
- Conditions: Payment verified + Checked-in
- Certificate includes: Name, Event, Date, Certificate ID
- Saved as PDF in `/certificates` folder
- Download link sent via email

### 14. What API rate limits did you implement?
**Answer**:
- **Login**: 5 attempts per 15 minutes (prevents brute force)
- **Registration**: 5 per 15 minutes (prevents spam)
- **General API**: 100 requests per 15 minutes
- Uses `express-rate-limit` package

### 15. How does referral code validation work?
**Answer**:
- Student enters referral code during signup
- Backend finds ambassador with that code
- Sets `user.referredBy = ambassadorId`
- When that user's payment is verified:
  - Ambassador's `points` field incremented by 10
  - Only happens on status change: Pending → Verified

### 16. What frontend state management did you use?
**Answer**:
- **Redux Toolkit** for auth state
- **React Query** for server state (API data)
- **Zustand** for lightweight auth store with persistence
- **React Hook Form + Zod** for form validation

### 17. How do you prevent duplicate UTR numbers?
**Answer**:
- `utrNumber` field has `unique: true` in schema
- MongoDB creates unique index
- If duplicate UTR submitted, database throws error
- Error caught and user informed: "UTR already used"

### 18. What happens during event capacity check?
**Answer**:
- Event has `capacity` and `registeredCount` fields
- Before registration: Check if `registeredCount < capacity`
- If available: Allow registration, increment count
- If full: Reject with "Event full" message
- On rejection: Decrement count (restore capacity)

### 19. How is the admin dashboard designed?
**Answer**:
- Shows all pending registrations
- Displays: User info, event, UTR, screenshot
- Two buttons: Approve / Reject
- Real-time updates using React Query
- Filters: By event, by date, by status

### 20. What is the deployment strategy?
**Answer**:
- **Backend**: Render/Railway/AWS (Node.js server)
- **Frontend**: Vercel (Next.js static + SSR)
- **Database**: MongoDB Atlas (cloud)
- **File Storage**: Local or Cloudinary
- **Environment variables** for all secrets

---

## 🎯 ARCHITECTURE DIAGRAM EXPLANATION

```
┌─────────────┐
│   STUDENT   │
└──────┬──────┘
       │ 1. Register + Upload Payment
       ↓
┌─────────────────────┐
│   REACT FRONTEND    │ (Next.js, Tailwind, Redux)
└─────────┬───────────┘
          │ 2. POST /api/registrations
          ↓
┌─────────────────────┐
│  EXPRESS BACKEND    │ (JWT Auth, Multer Upload)
│  - registrationCtrl │
│  - Save to MongoDB  │
└─────────┬───────────┘
          │ 3. Status = Pending
          ↓
┌─────────────────────┐
│   MONGODB DATABASE  │
│  - User             │
│  - Event            │
│  - Registration     │ ← status: pending
└─────────────────────┘
          ↑
          │ 4. Admin fetches pending
          │
┌─────────────────────┐
│  ADMIN DASHBOARD    │
│  - View UTR         │
│  - View Screenshot  │
│  - Approve/Reject   │
└─────────┬───────────┘
          │ 5. PUT /api/admin/verify/:id
          ↓
┌─────────────────────┐
│   BACKEND           │
│  - Status = Verified│
│  - Generate QR      │
│  - Send Email       │
│  - Award Points     │
└─────────────────────┘
```

---

## 💡 KEY INNOVATIONS TO HIGHLIGHT

1. **Manual Payment System** - Solves payment gateway cost issue
2. **Points on Verification** - Prevents referral fraud
3. **QR Security** - Generated only after payment approval
4. **Team Events** - Min/max validation
5. **Audit Logging** - All admin actions tracked
6. **Email Flow** - User informed at every step

---

## 🔍 COMMON FOLLOW-UP QUESTIONS

### Q: Why MongoDB instead of MySQL?
**A**: Flexible schema (nested team members), easy to scale, JSON-like documents, fast reads for event listings.

### Q: Why not use microservices?
**A**: For college-scale project, monolithic is simpler to develop, deploy, and maintain. Less overhead.

### Q: How will you handle 10,000 concurrent users?
**A**: 
- Load balancer (Nginx)
- Database indexing (email, utrNumber)
- Caching (Redis for event listings)
- CDN for static files
- Horizontal scaling (multiple backend instances)

### Q: What if admin forgets to verify a payment?
**A**: Automated reminder emails after 24 hours (future enhancement), or dashboard highlights old pending registrations.

---

## 📊 PROJECT METRICS (For Presentation)

- **Total Files**: 60+
- **API Endpoints**: 35+
- **Database Models**: 5
- **User Roles**: 5
- **Email Templates**: 4
- **Lines of Code**: ~5000+ (Backend + Frontend)

---

## 🎬 DEMO FLOW FOR VIVA

1. **Show Homepage** - Event listings
2. **Register as User** - With referral code
3. **Upload Payment** - UTR + Screenshot
4. **Show Pending Status** - User dashboard
5. **Switch to Admin** - Verification dashboard
6. **Approve Payment** - Generate QR
7. **Show User Dashboard** - QR code visible
8. **QR Scanner** - Volunteer check-in
9. **Generate Certificate** - After check-in
10. **Show Leaderboard** - Ambassador points

---

**Good Luck! 🎓**
