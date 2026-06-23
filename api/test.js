try {
  const app = require('../backend/server.js');
  module.exports = (req, res) => {
    res.json({ success: true, message: "Require backend/server.js succeeded!" });
  };
} catch (error) {
  module.exports = (req, res) => {
    res.status(500).json({
      success: false,
      message: "Require backend/server.js failed!",
      error: error.message,
      stack: error.stack
    });
  };
}
