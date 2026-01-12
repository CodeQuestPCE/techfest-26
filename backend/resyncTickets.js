const mongoose = require('mongoose');
require('dotenv').config();

const Event = require('./src/models/Event');
const Registration = require('./src/models/Registration');

const resyncTickets = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eventhub');
    console.log('Connected to MongoDB');

    const events = await Event.find({});
    for (const event of events) {
      let updated = false;
      for (const ticket of event.ticketTypes) {
        // Count active (non-cancelled) registrations for this event and ticket type
        const regCount = await Registration.countDocuments({
          event: event._id,
          ticketType: ticket.name,
          status: { $ne: 'cancelled' }
        });
        const newAvailable = Math.max(ticket.quantity - regCount, 0);
        if (ticket.available !== newAvailable) {
          console.log(`Event: ${event.title} | Ticket: ${ticket.name} | quantity: ${ticket.quantity} | active registrations: ${regCount} | available: ${ticket.available} -> ${newAvailable}`);
          ticket.available = newAvailable;
          updated = true;
        }
      }
      if (updated) {
        await event.save();
        console.log(`Updated event: ${event.title}`);
      }
    }
    console.log('✅ Ticket availability resynced for all events.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

resyncTickets();
