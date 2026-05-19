const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Explicitly use the environment variable, falling back safely to the IPv4 address
    const dbUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hotel_booking';
    
    const conn = await mongoose.connect(dbUri);
    console.log(`MongoDB Connected: ${conn.connection.host}:${conn.connection.port || '27018'}`);

    // --- AUTOMATIC REPLICA SET INITIALIZATION ---
    try {
      const adminDb = mongoose.connection.db.admin();
      await adminDb.command({ replSetInitiate: {} });
      console.log('✅ Replica set (rs0) initialized successfully!');
    } catch (replError) {
      if (replError.codeName === 'AlreadyInitialized') {
        console.log('ℹ️ Replica set (rs0) is already active and healthy.');
      } else {
        console.log('⚠️ Replica Set Engine Status:', replError.message);
      }
    }
    // --------------------------------------------

  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;