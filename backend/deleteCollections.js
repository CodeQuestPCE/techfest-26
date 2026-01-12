// Usage: node deleteCollections.js
// WARNING: This will delete all documents from the specified collections!

const mongoose = require('mongoose');
const Registration = require('./src/models/Registration');
const Event = require('./src/models/Event');
const User = require('./src/models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/techfest';

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Delete all documents from selected collections
  const regResult = await Registration.deleteMany({});
  console.log(`Deleted ${regResult.deletedCount} registrations.`);

  const eventResult = await Event.deleteMany({});
  console.log(`Deleted ${eventResult.deletedCount} events.`);

  const userResult = await User.deleteMany({});
  console.log(`Deleted ${userResult.deletedCount} users.`);

  mongoose.disconnect();
  console.log('Done. Selected collections cleared.');
}

main().catch(err => {
  console.error('Error:', err);
  mongoose.disconnect();
});
