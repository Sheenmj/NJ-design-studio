const mongoose = require('mongoose');
const dns = require('dns');

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.error("Error: MONGODB_URI environment variable is not defined. Please add it to your Vercel Project Settings.");
    return;
  }

  try {
    // Only set DNS servers if not running on Vercel
    if (!process.env.VERCEL) {
      dns.setServers(['8.8.8.8', '8.8.4.4']);
    }
  } catch (dnsErr) {
    console.warn('Failed to set DNS servers:', dnsErr.message);
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    // Do not crash the serverless container on Vercel
    if (!process.env.VERCEL) {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
