const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  paymentDetails: {
    upiId: {
      type: String,
      trim: true,
    },
    qrCodeUrl: {
      type: String,
    },
  },
}, {
  timestamps: true,
});

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);
