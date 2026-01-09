const Settings = require('../models/Settings');

// Get payment settings
exports.getPaymentSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    res.json({
      success: true,
      data: settings.paymentDetails || { upiId: '', qrCodeUrl: '' },
    });
  } catch (error) {
    console.error('Get payment settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment settings',
    });
  }
};

// Update payment settings (Admin only)
exports.updatePaymentSettings = async (req, res) => {
  try {
    const { upiId } = req.body;

    const settings = await Settings.getSettings();
    settings.paymentDetails.upiId = upiId || '';
    // Keep existing qrCodeUrl if not updating
    await settings.save();

    res.json({
      success: true,
      message: 'Payment settings updated successfully',
      data: settings.paymentDetails,
    });
  } catch (error) {
    console.error('Update payment settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment settings',
    });
  }
};

// Upload payment QR code
exports.uploadPaymentQR = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a QR code image',
      });
    }

    const qrCodeUrl = `/uploads/${req.file.filename}`;
    const settings = await Settings.getSettings();
    settings.paymentDetails.qrCodeUrl = qrCodeUrl;
    await settings.save();

    res.json({
      success: true,
      message: 'QR code uploaded successfully',
      data: { qrCodeUrl },
    });
  } catch (error) {
    console.error('Upload payment QR error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload QR code',
    });
  }
};
