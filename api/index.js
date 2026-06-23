let app;
try {
  app = require('../backend/server.js');
} catch (error) {
  console.error("Boot error:", error);
  app = (req, res) => {
    res.status(500).json({
      success: false,
      message: "Serverless function boot failed!",
      error: error.message,
      stack: error.stack
    });
  };
}
module.exports = app;
