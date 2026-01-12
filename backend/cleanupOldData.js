// Usage: node cleanupOldData.js
// - Removes registrations referencing deleted events
// - Fixes registrations with totalAmount 0 by recalculating from event ticket price

const mongoose = require('mongoose');
const Event = require('./src/models/Event');
const Registration = require('./src/models/Registration');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eventhub';

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB for cleanup');

  // Delete registrations that reference missing events
  const regs = await Registration.find({}).select('_id event totalAmount ticketType quantity createdAt');
  let removed = 0;
  let fixed = 0;

  for (const reg of regs) {
    const event = await Event.findById(reg.event);
    if (!event) {
      await Registration.deleteOne({ _id: reg._id });
      removed++;
      console.log(`Removed registration ${reg._id} referencing deleted event`);
      continue;
    }

    if (!reg.totalAmount || reg.totalAmount === 0) {
      const ticket = event.ticketTypes.find(t => t.name === reg.ticketType) || event.ticketTypes[0];
      if (ticket && ticket.price) {
        const newAmount = ticket.price * (reg.quantity || 1);
        reg.totalAmount = newAmount;
        await reg.save();
        fixed++;
        console.log(`Fixed registration ${reg._id}: totalAmount set to ${newAmount}`);
      }
    }
  }

  console.log(`Cleanup complete. Removed: ${removed}, Fixed: ${fixed}`);
  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Cleanup error:', err);
  mongoose.disconnect();
});
