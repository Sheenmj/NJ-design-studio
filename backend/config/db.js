const mongoose = require('mongoose');
const dns = require('dns');

const connectDB = async () => {
  try {
    // Use Google DNS to resolve MongoDB SRV records
    // (some ISP DNS servers fail to resolve SRV records)
    dns.setServers(['8.8.8.8', '8.8.4.4']);

    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
