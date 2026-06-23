const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');

/**
 * POST /api/auth/login
 * Authenticate admin and return a signed JWT.
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    // Find admin by email in Supabase
    const { data: admin, error: dbErr } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (dbErr || !admin) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    // Sign JWT
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn }
    );

    res.json({
      success: true,
      data: { token, expiresIn },
    });
  } catch (error) {
    next(error);
  }
};
