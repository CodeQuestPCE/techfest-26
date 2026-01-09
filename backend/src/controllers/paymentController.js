const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Registration = require('../models/Registration');

// @desc    Create payment intent
exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount, registrationId } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: 'usd',
      metadata: {
        registrationId,
        userId: req.user.id
      }
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Stripe webhook
exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      
      // Update registration payment status
      await Registration.findByIdAndUpdate(
        paymentIntent.metadata.registrationId,
        {
          paymentStatus: 'completed',
          paymentId: paymentIntent.id,
          status: 'confirmed'
        }
      );
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      
      await Registration.findByIdAndUpdate(
        failedPayment.metadata.registrationId,
        {
          paymentStatus: 'failed'
        }
      );
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

// @desc    Get payment details
exports.getPayment = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    // Check ownership
    if (registration.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    res.json({
      success: true,
      data: {
        paymentStatus: registration.paymentStatus,
        paymentId: registration.paymentId,
        totalAmount: registration.totalAmount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
