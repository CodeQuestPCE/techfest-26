const User = require('../models/User');
const crypto = require('crypto');

// @desc    Get leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const leaderboard = await User.find({ role: 'ambassador' })
      .select('name email college points referralCode')
      .sort({ points: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: leaderboard.length,
      data: leaderboard
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get ambassador stats
exports.getAmbassadorStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('name email points referralCode');

    if (user.role !== 'ambassador') {
      return res.status(403).json({
        success: false,
        message: 'Only ambassadors can access this'
      });
    }

    // Get referred users
    const referredUsers = await User.countDocuments({ referredBy: req.user.id });

    // Get rank
    const rank = await User.countDocuments({
      role: 'ambassador',
      points: { $gt: user.points }
    }) + 1;

    res.json({
      success: true,
      data: {
        user,
        referredUsers,
        rank
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Generate referral code for ambassador
exports.generateReferralCode = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user.role !== 'ambassador') {
      return res.status(403).json({
        success: false,
        message: 'Only ambassadors can generate referral codes'
      });
    }

    if (user.referralCode) {
      return res.json({
        success: true,
        data: {
          referralCode: user.referralCode
        }
      });
    }

    // Generate unique referral code
    const code = `AMB${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    user.referralCode = code;
    await user.save();

    res.json({
      success: true,
      message: 'Referral code generated',
      data: {
        referralCode: code
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Apply referral code (during signup)
exports.applyReferralCode = async (referralCode, userId) => {
  try {
    if (!referralCode) return;

    const ambassador = await User.findOne({ referralCode });
    if (!ambassador) {
      throw new Error('Invalid referral code');
    }

    await User.findByIdAndUpdate(userId, {
      referredBy: ambassador._id
    });

    return true;
  } catch (error) {
    throw error;
  }
};
