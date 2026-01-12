// Usage: node deleteDatabase.js
// WARNING: This will delete your entire MongoDB database!

const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/techfest';

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  await mongoose.connection.dropDatabase();
  console.log('Database dropped successfully!');

  mongoose.disconnect();
}

main().catch(err => {
  console.error('Error:', err);
  mongoose.disconnect();
});
