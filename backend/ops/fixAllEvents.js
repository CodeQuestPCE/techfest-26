const mongoose = require('mongoose');
require('dotenv').config();
const Event = require('../src/models/Event');

const fixAllEvents = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/event_management');
    console.log('Connected to MongoDB\n');

    const events = await Event.find({});
    console.log(`Found ${events.length} events to fix\n`);

    for (const event of events) {
      console.log(`\n📌 Fixing event: ${event.title}`);
      let updated = false;

      event.ticketTypes.forEach(ticket => {
        console.log(`   Current: ${ticket.name} - ${ticket.available}/${ticket.quantity} @ ₹${ticket.price}`);
        
        // Fix quantity if 0
        if (ticket.quantity === 0) {
          ticket.quantity = 100;
          updated = true;
          console.log(`   ✅ Set quantity to 100`);
        }

        // Fix available if 0 or greater than quantity
        if (ticket.available === 0 || ticket.available > ticket.quantity) {
          ticket.available = ticket.quantity;
          updated = true;
          console.log(`   ✅ Set available to ${ticket.quantity}`);
        }

        // Fix price if 0
        if (ticket.price === 0) {
          ticket.price = 101;
          updated = true;
          console.log(`   ✅ Set price to ₹101`);
        }

        console.log(`   Final: ${ticket.name} - ${ticket.available}/${ticket.quantity} @ ₹${ticket.price}`);
      });

      if (updated) {
        await event.save();
        console.log(`   💾 Saved changes for ${event.title}`);
      } else {
        console.log(`   ⏭️  No changes needed for ${event.title}`);
      }
    }

    console.log('\n✅ All events fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixAllEvents();
