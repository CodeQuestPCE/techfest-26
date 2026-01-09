const mongoose = require('mongoose');
require('dotenv').config();

const Event = require('./src/models/Event');

const fixEventPrice = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eventhub');
    console.log('Connected to MongoDB');

    // Find the crypto event
    const event = await Event.findOne({ _id: '6960c25ae8e9095ed36f3179' });
    
    if (!event) {
      console.log('Event not found');
      process.exit(1);
    }

    console.log('Current event:', event.title);
    console.log('Current tickets:', event.ticketTypes);

    // Update General ticket price to 101
    const generalTicket = event.ticketTypes.find(t => t.name === 'General');
    if (generalTicket) {
      generalTicket.price = 101;
      generalTicket.quantity = 100;
      generalTicket.available = 100;
      await event.save();
      console.log(`✅ Updated General ticket: ₹${generalTicket.price}, ${generalTicket.quantity} available`);
    }

    console.log('Event price updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixEventPrice();
