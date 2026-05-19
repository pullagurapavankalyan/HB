import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export const initiateSocketConnection = (userId) => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
    });
    console.log(`Connecting socket...`);
  }

  // Join personal room for private notifications
  if (userId) {
    socket.emit('join_personal_room', userId);
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const subscribeToNotifications = (cb) => {
  if (!socket) return true;
  socket.on('new_notification', (notification) => {
    cb(notification);
  });
};

export const unsubscribeFromNotifications = () => {
  if (!socket) return;
  socket.off('new_notification');
};

export const getSocket = () => socket;
