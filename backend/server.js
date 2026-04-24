const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env (local) or from env_file (docker)
dotenv.config();

// Validate critical env vars at startup
if (!process.env.MONGO_URI) {
  console.error('❌ FATAL: MONGO_URI is not set. Check your .env file.');
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.error('❌ FATAL: JWT_SECRET is not set. Check your .env file.');
  process.exit(1);
}

const app = express();

// CORS — allow Vercel frontend in production, localhost in dev
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
      'https://ecoquest-pearl.vercel.app',
      // Also allow any custom domain set via env var (e.g. custom Vercel domain)
      ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
    ]
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/quizzes', require('./routes/quizzes'));
app.use('/api/submissions', require('./routes/submissions'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/subjects', require('./routes/subjects'));

// Health check — useful to verify backend is running
app.get('/api/health', (req, res) => res.json({
  status: 'ok',
  message: 'EcoQuest API running',
  env: process.env.NODE_ENV,
  db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
}));

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);

    // Warn if email is not configured (dev mode)
    const emailReady = process.env.EMAIL_USER &&
                       process.env.EMAIL_PASS &&
                       process.env.EMAIL_USER !== 'your_gmail@gmail.com';
    if (!emailReady) {
      console.warn('⚠️  EMAIL not configured → registration auto-verifies users (dev mode)');
      console.warn('   Set EMAIL_USER + EMAIL_PASS in .env for real email verification');
    } else {
      console.log(`📧 Email: configured (${process.env.EMAIL_USER})`);
    }

    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('   Check your MONGO_URI in .env / .env.docker');
    process.exit(1);
  });
