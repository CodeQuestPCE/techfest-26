const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Send registration submission email
exports.sendRegistrationSubmittedEmail = async (email, name, eventTitle) => {
  try {
    const transporter = createTransporter();
    
    await transporter.sendMail({
      from: `"TechFest Platform" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Registration Submitted - Payment Under Verification',
      html: `
        <h2>Hello ${name},</h2>
        <p>Your registration for <strong>${eventTitle}</strong> has been submitted successfully.</p>
        <p><strong>Status:</strong> Pending Verification</p>
        <p>Our admin team will verify your payment details within 24-48 hours.</p>
        <p>You will receive another email once your payment is verified.</p>
        <br/>
        <p>Best regards,<br/>TechFest Team</p>
      `
    });

    console.log('Registration submitted email sent successfully');
  } catch (error) {
    console.error('Error sending registration submitted email:', error.message);
  }
};

// Send registration approved email
exports.sendRegistrationApprovedEmail = async (email, name, eventTitle, qrCode) => {
  try {
    const transporter = createTransporter();
    
    await transporter.sendMail({
      from: `"TechFest Platform" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '✅ Registration Approved - Your Ticket is Ready!',
      html: `
        <h2>Hello ${name},</h2>
        <p>Great news! Your registration for <strong>${eventTitle}</strong> has been approved.</p>
        <p><strong>Status:</strong> Verified ✅</p>
        <p>Your QR code ticket has been generated. Please show this at the event venue for check-in.</p>
        <br/>
        <p>You can view and download your ticket from your dashboard.</p>
        <br/>
        <p>See you at the event!</p>
        <p>Best regards,<br/>TechFest Team</p>
      `
    });

    console.log('Registration approved email sent successfully');
  } catch (error) {
    console.error('Error sending registration approved email:', error.message);
  }
};

// Send registration rejected email
exports.sendRegistrationRejectedEmail = async (email, name, eventTitle, reason) => {
  try {
    const transporter = createTransporter();
    
    await transporter.sendMail({
      from: `"TechFest Platform" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '❌ Registration Rejected - Action Required',
      html: `
        <h2>Hello ${name},</h2>
        <p>We regret to inform you that your registration for <strong>${eventTitle}</strong> has been rejected.</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p>Please register again with correct payment details.</p>
        <br/>
        <p>If you believe this is an error, please contact our support team.</p>
        <br/>
        <p>Best regards,<br/>TechFest Team</p>
      `
    });

    console.log('Registration rejected email sent successfully');
  } catch (error) {
    console.error('Error sending registration rejected email:', error.message);
  }
};

// Send certificate email
exports.sendCertificateEmail = async (email, name, eventTitle, certificateUrl) => {
  try {
    const transporter = createTransporter();
    
    await transporter.sendMail({
      from: `"TechFest Platform" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🎓 Your Certificate is Ready!',
      html: `
        <h2>Hello ${name},</h2>
        <p>Congratulations! Your certificate for <strong>${eventTitle}</strong> is now available.</p>
        <p>You can download it from your dashboard or use the link below:</p>
        <p><a href="${certificateUrl}">Download Certificate</a></p>
        <br/>
        <p>Thank you for participating!</p>
        <p>Best regards,<br/>TechFest Team</p>
      `
    });

    console.log('Certificate email sent successfully');
  } catch (error) {
    console.error('Error sending certificate email:', error.message);
  }
};

// Send password reset email
exports.sendPasswordResetEmail = async (email, name, resetUrl) => {
  try {
    const transporter = createTransporter();
    
    await transporter.sendMail({
      from: `"TechFest Platform" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🔒 Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #9333ea;">Hello ${name},</h2>
          <p>You requested to reset your password for your TechFest Platform account.</p>
          <p>Please click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: linear-gradient(to right, #9333ea, #db2777); 
                      color: white; 
                      padding: 12px 30px; 
                      text-decoration: none; 
                      border-radius: 25px;
                      font-weight: bold;
                      display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            This link will expire in 10 minutes for security reasons.
          </p>
          <p style="color: #666; font-size: 14px;">
            If you didn't request this password reset, please ignore this email or contact support if you have concerns.
          </p>
          <hr style="border: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">
            If the button doesn't work, copy and paste this link into your browser:<br/>
            <span style="color: #9333ea;">${resetUrl}</span>
          </p>
          <br/>
          <p>Best regards,<br/><strong>TechFest Team</strong></p>
        </div>
      `
    });

    console.log('Password reset email sent successfully to:', email);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error.message);
    return false;
  }
};

// Send registration resubmitted email (after user edits and resubmits)
exports.sendRegistrationResubmittedEmail = async (email, name, eventTitle) => {
  try {
    const transporter = createTransporter();

    await transporter.sendMail({
      from: `"TechFest Platform" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Registration Resubmitted - Payment Re-verification',
      html: `
        <h2>Hello ${name},</h2>
        <p>Your registration for <strong>${eventTitle}</strong> has been updated and resubmitted for verification.</p>
        <p><strong>Status:</strong> Pending Verification</p>
        <p>Our admin team will re-check your payment details and notify you once verification completes.</p>
        <br/>
        <p>Best regards,<br/>TechFest Team</p>
      `
    });

    console.log('Registration resubmitted email sent successfully');
  } catch (error) {
    console.error('Error sending registration resubmitted email:', error.message);
  }
};
