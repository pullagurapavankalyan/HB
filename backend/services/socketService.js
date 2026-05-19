/**
 * Global Socket.IO instance holder to allow services to emit events.
 * Initialized from server.js
 */
let io;

const initSocket = (socketIoInstance) => {
  io = socketIoInstance;
  io.on('connection', (socket) => {
    // When a user logs in on the frontend, they emit 'join_personal_room' with their user ID
    socket.on('join_personal_room', (userId) => {
      socket.join(userId);
    });
  });
};

/**
 * Emits an event to a specific user's private room
 */
const emitToUser = (userId, eventName, data) => {
  if (io) {
    io.to(userId).emit(eventName, data);
  }
};

/**
 * Emits an event globally
 */
const emitGlobal = (eventName, data) => {
  if (io) {
    io.emit(eventName, data);
  }
};

module.exports = { initSocket, emitToUser, emitGlobal };
