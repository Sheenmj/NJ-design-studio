const jwt = require('jsonwebtoken');

/**
 * JWT authentication middleware.
 * Verifies the Bearer token from the Authorization header
 * and attaches the decoded admin payload to req.admin.
 */
const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
};

module.exports = auth;
