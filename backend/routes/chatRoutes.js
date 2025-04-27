const express = require('express');
const chatController = require('../controllers/chatController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

// Get all chats for the current user
router.get('/my-chats', chatController.getUserChats);

// Create a new chat
router.post('/', chatController.createChat);

// Get a specific chat, send message, mark messages as read
router
  .route('/:id')
  .get(chatController.getChat)
  .post(chatController.sendMessage);

// Mark all messages as read
router.patch('/:id/read', chatController.markMessagesAsRead);

module.exports = router; 