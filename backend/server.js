require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');


// Import routes
const authRoutes = require('./routes/auth.routes');
const projectRoutes = require('./routes/project.routes');
const teamRoutes = require('./routes/team.routes');
const messageRoutes = require('./routes/message.routes');
const dbCheck = require('./middleware/dbCheck');

const app = express();
const PORT = process.env.PORT || 5000;

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

// Security headers
app.use(helmet());

// CORS — allow Vite dev server, configured frontend URL, and Vercel deployment
const allowedOrigins = [
  'http://localhost:5173',
  'https://nj-design-studio.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, mobile apps, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // Also allow any *.vercel.app preview deployments
      if (origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', dbCheck, authRoutes);
app.use('/api/projects', dbCheck, projectRoutes);
app.use('/api/team', dbCheck, teamRoutes);
app.use('/api/messages', dbCheck, messageRoutes);

// ---------------------------------------------------------------------------
// Error Handling
// ---------------------------------------------------------------------------

// Handle Multer errors (file too large, invalid type)
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      error: 'File too large. Maximum size is 5MB.',
    });
  }
  if (err.message && err.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }
  next(err);
});

// Global error handler
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err.stack || err.message);

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    return res.status(400).json({
      success: false,
      error: 'Invalid ID format',
    });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal server error',
    stack: err.stack,
  });
});

// ---------------------------------------------------------------------------
// Start Server
// ---------------------------------------------------------------------------

// Expose the app for serverless function import
module.exports = app;

const startServer = () => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
};

if (require.main === module) {
  startServer();
}
