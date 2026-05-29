let _io = null;

const initSocket = (io) => {
  _io = io;

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Join area room for location-based updates
    socket.on('join:area', (area) => {
      socket.join(`area:${area}`);
      console.log(`Socket ${socket.id} joined area: ${area}`);
    });

    // Join user room for personal notifications
    socket.on('join:user', (userId) => {
      socket.join(`user:${userId}`);
    });

    // Join authority room
    socket.on('join:authority', (dept) => {
      socket.join(`authority:${dept}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });
};

const getIO = () => {
  if (!_io) throw new Error('Socket.io not initialized');
  return _io;
};

// Emit new issue to area feed
const emitNewIssue = (issue) => {
  if (!_io) return;
  _io.emit('issue:new', issue);
  if (issue.area) {
    _io.to(`area:${issue.area}`).emit('issue:new:area', issue);
  }
};

// Emit status update to issue reporter
const emitStatusUpdate = (issue, update) => {
  if (!_io) return;
  _io.to(`user:${issue.userId}`).emit('issue:status', { issue, update });
  _io.emit('issue:updated', { issueId: issue.id, status: update.status });
};

// Emit high severity alert to authorities
const emitHighSeverityAlert = (issue) => {
  if (!_io) return;
  _io.emit('issue:critical', issue);
};

// Emit escalation event
const emitEscalation = (issue, comment) => {
  if (!_io) return;
  _io.emit('issue:escalated', { issue, comment });
};

// Emit job progress
const emitJobProgress = (userId, data) => {
  if (!_io) return;
  _io.to(`user:${userId}`).emit('job:progress', data);
};

module.exports = {
  initSocket,
  getIO,
  emitNewIssue,
  emitStatusUpdate,
  emitHighSeverityAlert,
  emitEscalation,
  emitJobProgress,
};
