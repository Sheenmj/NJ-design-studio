const dbCheck = (req, res, next) => {
  if (!process.env.VITE_SUPABASE_URL || (!process.env.VITE_SUPABASE_PUBLISHABLE_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY)) {
    return res.status(503).json({
      success: false,
      error: 'Database configuration error: Supabase environment variables (VITE_SUPABASE_URL and key) are missing.'
    });
  }
  next();
};

module.exports = dbCheck;
