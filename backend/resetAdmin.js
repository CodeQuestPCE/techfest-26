const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  college: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin', 'coordinator', 'ambassador'], default: 'user' },
  points: { type: Number, default: 0 },
  referralCode: { type: String, unique: true, sparse: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isEmailVerified: { type: Boolean, default: false }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

async function resetAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Delete existing admin
    await User.deleteMany({ email: 'pcodequest@gmail.com' });
    console.log('🗑️  Deleted old admin account');

    // Hash password
    const hashedPassword = await bcrypt.hash('admin@#pce', 10);

    // Create new admin user
    const admin = await User.create({
      name: 'PCE Admin',
      email: 'pcodequest@gmail.com',
      password: hashedPassword,
      college: 'PCE Purnea',
      phone: '9876543210',
      role: 'admin',
      points: 0,
      isEmailVerified: true
    });

    console.log('\n✅ New admin user created successfully!\n');
    console.log('📧 Email: pcodequest@gmail.com');
    console.log('🔑 Password: admin@#pce');
    console.log('👤 Role:', admin.role);
    console.log('\n🎉 You can now login at: https://techfestpce.onrender.com/login\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetAdmin();
