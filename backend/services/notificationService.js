const Notification = require('../models/Notification');
const { emitToUser } = require('./socketService');

/**
 * Creates a notification in DB and emits real-time event via Socket.IO
 */
const createAndSendNotification = async (recipientId, type, title, message, actionUrl = null) => {
  const notification = await Notification.create({
    recipientId,
    type,
    title,
    message,
    actionUrl
  });

  // Emit real-time socket event
  emitToUser(recipientId.toString(), 'new_notification', notification);

  return notification;
};

module.exports = { createAndSendNotification };
