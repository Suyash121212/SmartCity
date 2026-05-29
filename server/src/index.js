require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const { Server } = require('socket.io');

const { initSocket } = require('./services/socket.service');
const authRoutes = require('./routes/auth.routes');
const issueRoutes = require('./routes/issue.routes');
const commentRoutes = require('./routes/comment.routes');
const adminRoutes = require('./routes/admin.routes');
const reportRoutes = require('./routes/report.routes');
const analyzeRoutes = require('./routes/analyze.routes');
const cityRoutes = require('./routes/city.routes');
const profileRoutes = require('./routes/profile.routes');
const { initQueue } = require('./queues/issue.queue');
const { startWorker } = require('./queues/issue.worker');

const app = express();
const httpServer = http.createServer(app);

// Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
initSocket(io);

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/issues', commentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', reportRoutes);
app.use('/api/analyze', analyzeRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/profile', profileRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  // Initialize queue (async — waits for Redis connection)
  // await initQueue();
  // Start worker after queue is ready
  // try { startWorker(); } catch (e) { console.warn('Worker init failed:', e.message); }
});

module.exports = { app, io };
