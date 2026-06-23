const mongoose = require('mongoose');

const dbCheck = (req, res, next) => {
  if (!process.env.MONGODB_URI) {
    return res.status(503).json({
      success: false,
      error: 'Database configuration error: MONGODB_URI environment variable is missing in Vercel settings.'
    });
  }
  if (mongoose.connection.readyState === 0) {
    return res.status(503).json({
      success: false,
      error: 'Database is disconnected. Please check your database status or connection string.'
    });
  }
  next();
};

module.exports = dbCheck;
