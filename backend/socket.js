const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/user');
const Chat = require('./models/chat');

// Store active connections with user IDs
const activeUsers = new Map();

function setupSocketIO(server) {
  const io = socketIO(server, {
    cors: {
      origin: '*', // Allow all origins in development
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      // Allow connection without token, but limit functionality
      if (!token) {
        console.log('Socket connected without authentication');
        socket.userId = null;
        socket.isAuthenticated = false;
        return next();
      }
      
      // Verify the token
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Attach the user ID to the socket for future reference
        socket.userId = decoded.id;
        socket.isAuthenticated = true;
        
        next();
      } catch (tokenError) {
        console.error('Invalid token:', tokenError.message);
        socket.userId = null;
        socket.isAuthenticated = false;
        return next();
      }
    } catch (error) {
      console.error('Socket authentication error:', error.message);
      return next(new Error('Authentication error: ' + error.message));
    }
  });

  // Handle connections
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId || 'unauthenticated'}`);
    
    // If authenticated, track the user
    if (socket.isAuthenticated && socket.userId) {
      // Add user to active users
      activeUsers.set(socket.userId, socket.id);
      
      // Notify others that this user is online
      io.emit('user_status', { 
        userId: socket.userId, 
        status: 'online' 
      });
    }
    
    // Join a chat room
    socket.on('join_chat', async (chatId) => {
      try {
        // Require authentication for joining chats
        if (!socket.isAuthenticated) {
          socket.emit('error', { message: 'Authentication required to join chat' });
          return;
        }
        
        // Check if user is part of this chat
        const chat = await Chat.findById(chatId);
        
        if (!chat) {
          socket.emit('error', { message: 'Chat not found' });
          return;
        }
        
        // Verify user belongs to this chat
        const userIsParticipant = 
          chat.client.toString() === socket.userId || 
          chat.freelancer.toString() === socket.userId;
          
        if (!userIsParticipant) {
          socket.emit('error', { message: 'Not authorized to join this chat' });
          return;
        }
        
        // Join the chat room
        socket.join(chatId);
        console.log(`User ${socket.userId} joined chat: ${chatId}`);
        
        // Emit chat history to the user
        socket.emit('chat_history', {
          chatId,
          messages: chat.messages
        });
      } catch (error) {
        console.error('Error joining chat:', error);
        socket.emit('error', { message: 'Failed to join chat' });
      }
    });
    
    // Handle new message
    socket.on('send_message', async (data) => {
      try {
        // Require authentication for sending messages
        if (!socket.isAuthenticated) {
          socket.emit('error', { message: 'Authentication required to send messages' });
          return;
        }
        
        const { chatId, content } = data;
        
        // Find the chat
        const chat = await Chat.findById(chatId);
        
        if (!chat) {
          socket.emit('error', { message: 'Chat not found' });
          return;
        }
        
        // Verify user belongs to this chat
        const userIsParticipant = 
          chat.client.toString() === socket.userId || 
          chat.freelancer.toString() === socket.userId;
          
        if (!userIsParticipant) {
          socket.emit('error', { message: 'Not authorized to send messages in this chat' });
          return;
        }
        
        // Create the new message
        const newMessage = {
          sender: socket.userId,
          content,
          timestamp: new Date(),
          read: false
        };
        
        // Add message to the chat
        chat.messages.push(newMessage);
        chat.lastActivity = new Date();
        await chat.save();
        
        // Broadcast to everyone in the chat room
        io.to(chatId).emit('new_message', {
          chatId,
          message: newMessage
        });
        
        // Send notification to the other participant if they're not in the room
        const otherParticipantId = 
          chat.client.toString() === socket.userId 
            ? chat.freelancer.toString() 
            : chat.client.toString();
            
        const otherParticipantSocketId = activeUsers.get(otherParticipantId);
        
        if (otherParticipantSocketId) {
          io.to(otherParticipantSocketId).emit('message_notification', {
            chatId,
            message: newMessage
          });
        }
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });
    
    // Mark messages as read
    socket.on('mark_read', async (data) => {
      try {
        // Require authentication for marking messages as read
        if (!socket.isAuthenticated) {
          socket.emit('error', { message: 'Authentication required to mark messages as read' });
          return;
        }
        
        const { chatId } = data;
        
        const chat = await Chat.findById(chatId);
        
        if (!chat) {
          socket.emit('error', { message: 'Chat not found' });
          return;
        }
        
        // Verify user belongs to this chat
        const userIsParticipant = 
          chat.client.toString() === socket.userId || 
          chat.freelancer.toString() === socket.userId;
          
        if (!userIsParticipant) {
          socket.emit('error', { message: 'Not authorized to access this chat' });
          return;
        }
        
        // Mark messages as read where sender is not the current user
        let updated = false;
        chat.messages.forEach(msg => {
          if (msg.sender.toString() !== socket.userId && !msg.read) {
            msg.read = true;
            updated = true;
          }
        });
        
        if (updated) {
          await chat.save();
          
          // Notify all participants about read messages
          io.to(chatId).emit('messages_read', {
            chatId,
            readBy: socket.userId
          });
        }
      } catch (error) {
        console.error('Error marking messages as read:', error);
        socket.emit('error', { message: 'Failed to mark messages as read' });
      }
    });
    
    // Handle typing indicators
    socket.on('typing', (data) => {
      // Require authentication for typing indicators
      if (!socket.isAuthenticated) {
        socket.emit('error', { message: 'Authentication required for typing indicators' });
        return;
      }
      
      const { chatId, isTyping } = data;
      
      // Broadcast typing status to the chat room except sender
      socket.to(chatId).emit('user_typing', {
        chatId,
        userId: socket.userId,
        isTyping
      });
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId || 'unauthenticated'}`);
      
      if (socket.isAuthenticated && socket.userId) {
        // Remove from active users
        activeUsers.delete(socket.userId);
        
        // Notify others that this user is offline
        io.emit('user_status', { 
          userId: socket.userId, 
          status: 'offline' 
        });
      }
    });
  });

  return io;
}

module.exports = setupSocketIO; 