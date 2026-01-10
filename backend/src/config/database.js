const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Auto-create admin user if it doesn't exist
    await createAdminIfNotExists();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

async function createAdminIfNotExists() {
  try {
    const User = mongoose.model('User');
    
    const adminExists = await User.findOne({ email: 'pcodequest@gmail.com' });
    
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin@#pce', 10);
      
      await User.create({
        name: 'PCE Admin',
        email: 'pcodequest@gmail.com',
        password: hashedPassword,
        college: 'PCE Purnea',
        phone: '9876543210',
        role: 'admin',
        points: 0,
        isEmailVerified: true
      });
      
      console.log('✅ Admin user created automatically');
      console.log('📧 Email: pcodequest@gmail.com');
      console.log('🔑 Password: admin@#pce');
    } else {
      console.log('✓ Admin user already exists');
    }
  } catch (error) {
    // Ignore if User model not loaded yet
    if (error.name !== 'MissingSchemaError') {
      console.error('Error creating admin:', error.message);
    }
  }
}

module.exports = connectDB;
