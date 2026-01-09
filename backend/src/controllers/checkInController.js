const Registration = require('../models/Registration');
const Ticket = require('../models/Ticket');

// @desc    Validate QR code and check-in (Volunteer)
exports.validateCheckIn = async (req, res) => {
  try {
    const { qrHash } = req.body;

    if (!qrHash) {
      return res.status(400).json({
        success: false,
        message: 'QR hash is required'
      });
    }

    // Find registration by QR hash
    const registration = await Registration.findOne({ qrCodeHash: qrHash })
      .populate('event', 'title startDate venue')
      .populate('user', 'name email phone');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'QR code not found in system. Please verify the QR code is from a valid registration.'
      });
    }

    // Check if registration is verified
    if (registration.status !== 'verified') {
      return res.status(400).json({
        success: false,
        message: `Registration payment is ${registration.status}. Please wait for admin approval before check-in.`
      });
    }

    // Check if already checked in
    if (registration.checkInStatus) {
      return res.status(400).json({
        success: false,
        message: `Already checked in at ${new Date(registration.checkInTime).toLocaleString()}`,
        data: {
          checkInTime: registration.checkInTime,
          user: registration.user
        }
      });
    }

    // Update check-in status
    registration.checkInStatus = true;
    registration.checkInTime = new Date();
    await registration.save();

    res.json({
      success: true,
      message: 'Check-in successful',
      data: {
        user: registration.user,
        event: registration.event,
        checkInTime: registration.checkInTime,
        teamName: registration.teamName
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get check-in status
exports.getCheckInStatus = async (req, res) => {
  try {
    const { qrHash } = req.params;

    const registration = await Registration.findOne({ qrCodeHash: qrHash })
      .populate('event', 'title startDate')
      .populate('user', 'name email');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Invalid QR code'
      });
    }

    res.json({
      success: true,
      data: {
        checkInStatus: registration.checkInStatus,
        checkInTime: registration.checkInTime,
        status: registration.status,
        user: registration.user,
        event: registration.event
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get event check-in stats (Admin/Coordinator)
exports.getEventCheckInStats = async (req, res) => {
  try {
    const { eventId } = req.params;

    const totalRegistrations = await Registration.countDocuments({
      event: eventId,
      status: 'verified'
    });

    const checkedIn = await Registration.countDocuments({
      event: eventId,
      status: 'verified',
      checkInStatus: true
    });

    const pending = totalRegistrations - checkedIn;

    res.json({
      success: true,
      data: {
        total: totalRegistrations,
        checkedIn,
        pending,
        percentage: totalRegistrations > 0 ? ((checkedIn / totalRegistrations) * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
