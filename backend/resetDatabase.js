const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const resetDatabase = async () => {
  try {
    console.log('🗑️  Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('✅ Connected to MongoDB');
    console.log('⚠️  WARNING: This will delete ALL data!');
    
    const db = mongoose.connection.db;
    
    // Get all collections
    const collections = await db.listCollections().toArray();
    
    console.log(`\n📊 Found ${collections.length} collections:`);
    collections.forEach(col => console.log(`   - ${col.name}`));
    
    console.log('\n🗑️  Dropping all collections...\n');
    
    // Drop each collection
    for (const collection of collections) {
      await db.dropCollection(collection.name);
      console.log(`   ✅ Dropped: ${collection.name}`);
    }
    
    console.log('\n✅ Database reset complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Run: node createAdmin.js (to create admin account)');
    console.log('   2. Restart backend server');
    console.log('   3. All users need to register again\n');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting database:', error.message);
    process.exit(1);
  }
};

// Confirmation check
console.log('\n⚠️  ========================================');
console.log('⚠️  WARNING: DATABASE RESET');
console.log('⚠️  ========================================\n');
console.log('This will DELETE ALL DATA including:');
console.log('  • Users');
console.log('  • Events');
console.log('  • Registrations');
console.log('  • Payments');
console.log('  • Ambassadors');
console.log('  • Logs');
console.log('  • Everything!\n');
console.log('This action CANNOT be undone!\n');
console.log('Starting in 3 seconds...\n');

setTimeout(() => {
  resetDatabase();
}, 3000);
