// Usage: node findRegistration.js <utr|email>
const mongoose = require('mongoose');
const Registration = require('./src/models/Registration');
const Event = require('./src/models/Event');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eventhub';

async function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error('Provide UTR or email as argument');
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  let reg = await Registration.findOne({ utrNumber: arg });
  if (!reg) {
    // try by user email via population
    reg = await Registration.findOne({}).populate('user');
    if (reg && reg.user && reg.user.email === arg) {
      // found
    } else {
      // try searching by attendeeInfo.email
      reg = await Registration.findOne({ 'attendeeInfo.email': arg });
    }
  }

  if (!reg) {
    console.log('Registration not found for', arg);
    await mongoose.disconnect();
    return;
  }

  console.log('Registration ID:', reg._id.toString());
  console.log('Total Amount stored:', reg.totalAmount);
  console.log('Quantity:', reg.quantity);
  console.log('Ticket Type:', reg.ticketType);
  console.log('Payment Status:', reg.paymentStatus);

  const event = await Event.findById(reg.event);
  if (event) {
    console.log('Event:', event.title || event._id.toString());
    const ticket = event.ticketTypes.find(t => t.name === reg.ticketType) || event.ticketTypes[0];
    if (ticket) {
      console.log('Event ticket price:', ticket.price);
      console.log('Event ticket available:', ticket.available);
    } else {
      console.log('No matching ticket found on event');
    }
  } else {
    console.log('Event not found for registration');
  }

  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  mongoose.disconnect();
});
