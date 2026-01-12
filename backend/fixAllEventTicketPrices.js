// Usage: node fixAllEventTicketPrices.js
// This script updates all events so that ticketTypes[0].price matches registrationFee
require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');
const Event = require('./src/models/Event');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const events = await Event.find({});
  let updated = 0;
  for (const event of events) {
    if (Array.isArray(event.ticketTypes) && event.ticketTypes.length > 0) {
      if (event.ticketTypes[0].price !== event.registrationFee) {
        event.ticketTypes[0].price = event.registrationFee;
        await event.save();
        updated++;
        console.log(`Updated event: ${event.title} (${event._id})`);
      }
    }
  }
  console.log(`Done. Updated ${updated} events.`);
  mongoose.disconnect();
}

main().catch(err => {
  console.error('Error:', err);
  mongoose.disconnect();
});
