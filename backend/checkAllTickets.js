const mongoose = require('mongoose');
const Event = require('./src/models/Event');

mongoose.connect('mongodb://localhost:27017/event_management')
  .then(async () => {
    console.log('Connected to MongoDB\n');

    const events = await Event.find({});
    
    console.log(`Found ${events.length} events:\n`);
    
    events.forEach(event => {
      console.log(`📌 Event: ${event.title} (${event._id})`);
      console.log(`   Type: ${event.eventType}`);
      
      event.ticketTypes.forEach(ticket => {
        const status = ticket.available === 0 ? '❌ SOLD OUT' : 
                      ticket.available < 10 ? '⚠️  LOW' : '✅ OK';
        console.log(`   ${status} ${ticket.name}: ${ticket.available}/${ticket.quantity} available (₹${ticket.price})`);
      });
      console.log('');
    });

    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
