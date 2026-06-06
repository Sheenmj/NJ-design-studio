const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const auth = require('../middleware/auth');
const messageController = require('../controllers/message.controller');

// Rate limiter for public message submission — max 10 per 15 minutes per IP
const messageRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests. Please try again later.' },
});

// Public route (rate-limited)
router.post('/', messageRateLimiter, messageController.create);

// Protected routes (require JWT)
router.get('/', auth, messageController.getAll);
router.get('/:id', auth, messageController.getOne);
router.patch('/:id/read', auth, messageController.toggleRead);
router.delete('/:id', auth, messageController.remove);

module.exports = router;
