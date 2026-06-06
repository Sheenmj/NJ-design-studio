/**
 * Admin Seed Script
 *
 * Creates the initial admin user from environment variables.
 * Run with: node scripts/seedAdmin.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

const seedAdmin = async () => {
  try {
    // Validate required env vars
    if (!process.env.MONGODB_URI) {
      console.error('Error: MONGODB_URI is not set in .env');
      process.exit(1);
    }
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
      console.error('Error: ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
      process.exit(1);
    }

    // Use Google DNS for SRV resolution
    const dns = require('dns');
    dns.setServers(['8.8.8.8', '8.8.4.4']);

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if an admin already exists
    const existingAdmin = await Admin.findOne({ email: process.env.ADMIN_EMAIL.toLowerCase() });

    if (existingAdmin) {
      console.log('Admin already exists with email:', existingAdmin.email);
    } else {
      const admin = await Admin.create({
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
      });
      console.log('Admin created successfully with email:', admin.email);
    }
  } catch (error) {
    console.error('Seed error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

seedAdmin();
