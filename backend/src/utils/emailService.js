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
