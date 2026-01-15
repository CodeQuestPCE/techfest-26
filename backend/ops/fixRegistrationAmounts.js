// Usage: node fixRegistrationAmounts.js
// Updates all registrations with totalAmount 0 to use the correct ticket price from their event

const mongoose = require('mongoose');
const Event = require('../src/models/Event');
const Registration = require('../src/models/Registration');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/eventhub';

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Find all registrations with totalAmount 0
  const registrations = await Registration.find({ totalAmount: 0 });
  console.log(`Found ${registrations.length} registrations with totalAmount 0`);

  let updated = 0;
  for (const reg of registrations) {
    // Find the event and ticket price
    const event = await Event.findById(reg.event);
    if (!event) continue;
    const ticket = event.ticketTypes.find(t => t.name === reg.ticketType);
    if (!ticket) continue;
    const newAmount = ticket.price * reg.quantity;
    if (newAmount > 0) {
      reg.totalAmount = newAmount;
      await reg.save();
      updated++;
      console.log(`Updated registration ${reg._id}: totalAmount set to ${newAmount}`);
    }
  }

  console.log(`Done. Updated ${updated} registrations.`);
  mongoose.disconnect();
}

main().catch(err => {
  console.error('Error:', err);
  mongoose.disconnect();
});
