const PDFDocument = require('pdfkit');
const stream = require('stream');
const cloudinaryUploadPDF = require('../middleware/cloudinaryUploadPDF');
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


    // Create PDF document in memory
    const doc = new PDFDocument({
      layout: 'landscape',
      size: 'A4',
    });

    const bufferStream = new stream.PassThrough();
    const chunks = [];
    bufferStream.on('data', (chunk) => chunks.push(chunk));
    bufferStream.on('end', async () => {
      const pdfBuffer = Buffer.concat(chunks);
      // Upload to Cloudinary
      const result = await cloudinaryUploadPDF(pdfBuffer);
      // Mark certificate as issued and save URL
      registration.certificateIssued = true;
      registration.certificateUrl = result.secure_url;
      await registration.save();
      // Send email
      await emailService.sendCertificateEmail(
        registration.user.email,
        registration.user.name,
        registration.event.title,
        result.secure_url
      );
      res.json({
        success: true,
        message: 'Certificate generated successfully',
        data: {
          certificateUrl: result.secure_url
        }
      });
    });
    doc.pipe(bufferStream);

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

    // Serve the Cloudinary URL if available
    if (!registration.certificateUrl) {
      return res.status(404).json({
        success: false,
        message: 'Certificate file not found'
      });
    }
    // Option 1: Redirect to Cloudinary URL
    return res.redirect(registration.certificateUrl);
    // Option 2: If you want to stream the file, you can fetch and pipe it (not implemented here)
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
