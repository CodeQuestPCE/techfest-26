const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const Registration = require('../models/Registration');
const emailService = require('../utils/emailService');

// @desc    Generate certificate
exports.generateCertificate = async (req, res) => {
  try {
    const { registrationId } = req.params;

    const registration = await Registration.findById(registrationId)
      .populate('event', 'title startDate')
      .populate('user', 'name email');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    // Validate conditions
    if (registration.status !== 'verified') {
      return res.status(400).json({
        success: false,
        message: 'Registration must be verified'
      });
    }

    if (!registration.checkInStatus) {
      return res.status(400).json({
        success: false,
        message: 'User must be checked in to receive certificate'
      });
    }

    // Check authorization
    if (registration.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Check if certificate already issued
    if (registration.certificateIssued) {
      return res.json({
        success: true,
        message: 'Certificate already generated',
        data: {
          certificateUrl: `/certificates/${registrationId}.pdf`
        }
      });
    }

    // Create certificates directory if it doesn't exist
    const certDir = path.join(__dirname, '../../certificates');
    if (!fs.existsSync(certDir)) {
      fs.mkdirSync(certDir, { recursive: true });
    }

    const certificatePath = path.join(certDir, `${registrationId}.pdf`);

    // Create PDF document
    const doc = new PDFDocument({
      layout: 'landscape',
      size: 'A4',
    });

    // Pipe to file
    const writeStream = fs.createWriteStream(certificatePath);
    doc.pipe(writeStream);

    // Certificate design
    doc.fontSize(40)
       .font('Helvetica-Bold')
       .text('CERTIFICATE OF PARTICIPATION', 100, 100, {
         align: 'center'
       });

    doc.fontSize(20)
       .font('Helvetica')
       .text('This is to certify that', 100, 200, {
         align: 'center'
       });

    doc.fontSize(30)
       .font('Helvetica-Bold')
       .text(registration.user.name, 100, 240, {
         align: 'center'
       });

    doc.fontSize(20)
       .font('Helvetica')
       .text(`has successfully participated in`, 100, 300, {
         align: 'center'
       });

    doc.fontSize(25)
       .font('Helvetica-Bold')
       .text(registration.event.title, 100, 340, {
         align: 'center'
       });

    doc.fontSize(16)
       .font('Helvetica')
       .text(`Date: ${new Date(registration.event.startDate).toLocaleDateString()}`, 100, 400, {
         align: 'center'
       });

    doc.fontSize(12)
       .text(`Certificate ID: ${registrationId}`, 100, 500, {
         align: 'center'
       });

    doc.end();

    // Wait for PDF to be written
    writeStream.on('finish', async () => {
      // Mark certificate as issued
      registration.certificateIssued = true;
      await registration.save();

      // Send email
      const certificateUrl = `${process.env.FRONTEND_URL}/certificates/${registrationId}.pdf`;
      await emailService.sendCertificateEmail(
        registration.user.email,
        registration.user.name,
        registration.event.title,
        certificateUrl
      );

      res.json({
        success: true,
        message: 'Certificate generated successfully',
        data: {
          certificateUrl: `/certificates/${registrationId}.pdf`
        }
      });
    });

    writeStream.on('error', (error) => {
      throw error;
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Download certificate
exports.downloadCertificate = async (req, res) => {
  try {
    const { registrationId } = req.params;

    const registration = await Registration.findById(registrationId);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    // Check authorization
    if (registration.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (!registration.certificateIssued) {
      return res.status(400).json({
        success: false,
        message: 'Certificate not yet issued'
      });
    }

    const certificatePath = path.join(__dirname, '../../certificates', `${registrationId}.pdf`);

    if (!fs.existsSync(certificatePath)) {
      return res.status(404).json({
        success: false,
        message: 'Certificate file not found'
      });
    }

    res.download(certificatePath);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
