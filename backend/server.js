// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const path = require('path');
// const rateLimit = require('express-rate-limit');
// require('dotenv').config();

// const authRoutes     = require('./routes/auth');
// const caseRoutes     = require('./routes/cases');
// const documentRoutes = require('./routes/documents');
// const hearingRoutes  = require('./routes/hearings');
// const userRoutes     = require('./routes/users');
// const affidavitRoutes = require('./routes/affidavits');

// const app = express();

// // ── Rate Limiting ──────────────────────────────────────────────
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 200,
//   message: { success: false, message: 'Too many requests. Please try again later.' },
// });
// app.use('/api/', limiter);

// // ── Middleware ─────────────────────────────────────────────────
// app.use(cors({
//   origin: process.env.CLIENT_URL || 'https://just-ease-eight.vercel.app/',
//   credentials: true,
// }));
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// // ── Static Files (uploads) ─────────────────────────────────────
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // ── API Routes ─────────────────────────────────────────────────
// app.use('/api/auth',       authRoutes);
// app.use('/api/cases',      caseRoutes);
// app.use('/api/documents',  documentRoutes);
// app.use('/api/hearings',   hearingRoutes);
// app.use('/api/users',      userRoutes);
// app.use('/api/affidavits', affidavitRoutes);

// // ── Health Check ───────────────────────────────────────────────
// app.get('/api/health', (req, res) => {
//   res.json({ success: true, message: 'JustEase API is running', timestamp: new Date() });
// });

// // ── Global Error Handler ───────────────────────────────────────
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   const status = err.statusCode || 500;
//   res.status(status).json({
//     success: false,
//     message: err.message || 'Internal Server Error',
//     ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
//   });
// });

// // ── 404 Handler ────────────────────────────────────────────────
// app.use((req, res) => {
//   res.status(404).json({ success: false, message: 'Route not found' });
// });

// // ── Database & Server Start ────────────────────────────────────
// const PORT = process.env.PORT || 5000;

// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => {
//     console.log('✅ MongoDB connected');
//     app.listen(PORT, () => {
//       console.log(`🚀 JustEase API running on http://localhost:${PORT}`);
//       console.log(`📌 Environment: ${process.env.NODE_ENV}`);
//     });
//   })
//   .catch((err) => {
//     console.error('❌ MongoDB connection failed:', err.message);
//     process.exit(1);
//   });

// module.exports = app;
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes      = require('./routes/auth');
const caseRoutes      = require('./routes/cases');
const documentRoutes  = require('./routes/documents');
const hearingRoutes   = require('./routes/hearings');
const userRoutes      = require('./routes/users');
const affidavitRoutes = require('./routes/affidavits');

const app = express();

// ── CORS ───────────────────────────────────────────────────────
// Allow requests from the deployed Vercel frontend AND localhost for dev
const allowedOrigins = [
  'https://just-ease-eight.vercel.app',   // ← production Vercel URL
  'http://localhost:5173',                 // ← local Vite dev server
  'http://localhost:3000',                 // ← fallback local
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl, Postman, mobile apps)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin} is not in the allowed list`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Handle pre-flight OPTIONS requests for all routes
app.options('*', cors());

// ── Rate Limiting ──────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});
app.use('/api/', limiter);

// ── Body Parsers ───────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Static Files (uploaded documents) ─────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── API Routes ─────────────────────────────────────────────────
app.use('/api/auth',       authRoutes);
app.use('/api/cases',      caseRoutes);
app.use('/api/documents',  documentRoutes);
app.use('/api/hearings',   hearingRoutes);
app.use('/api/users',      userRoutes);
app.use('/api/affidavits', affidavitRoutes);

// ── Health Check ───────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'JustEase API is running ⚖️',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── Root ───────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ success: true, message: 'JustEase Backend API — visit /api/health for status.' });
});

// ── Global Error Handler ───────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ── 404 ────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Connect to MongoDB & Start Server ─────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀 JustEase API → http://localhost:${PORT}`);
      console.log(`🌍 Environment  : ${process.env.NODE_ENV}`);
      console.log(`🔗 Allowed CORS : ${allowedOrigins.join(', ')}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

module.exports = app;
