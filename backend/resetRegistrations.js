const mongoose = require('mongoose');
require('dotenv').config();

const Registration = require('./src/models/Registration');

const resetRegistrations = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eventhub');
    console.log('Connected to MongoDB');

    // Delete all registrations
    const result = await Registration.deleteMany({});
    console.log(`Deleted ${result.deletedCount} registrations.`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

resetRegistrations();
