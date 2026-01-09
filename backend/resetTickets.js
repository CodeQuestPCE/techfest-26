const mongoose = require('mongoose');
require('dotenv').config();

const Event = require('./src/models/Event');

const resetTickets = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eventhub');
    console.log('Connected to MongoDB');

    // Find the crypto event and reset ticket availability
    const event = await Event.findOne({ _id: '6960c25ae8e9095ed36f3179' });
    
    if (!event) {
      console.log('Event not found');
      process.exit(1);
    }

    console.log('Current event:', event.title);
    console.log('Current tickets:', event.ticketTypes);

    // Reset General ticket availability - set to 100 if quantity is 0
    const generalTicket = event.ticketTypes.find(t => t.name === 'General');
    if (generalTicket) {
      if (generalTicket.quantity === 0) {
        generalTicket.quantity = 100; // Set default quantity
      }
      generalTicket.available = generalTicket.quantity;
      await event.save();
      console.log(`✅ Reset General tickets: ${generalTicket.quantity} available`);
    }

    console.log('Tickets reset successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

resetTickets();
