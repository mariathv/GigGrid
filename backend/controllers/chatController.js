const Chat = require('../models/chat');
const User = require('../models/user');
const Order = require('../models/order');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Create a new chat
exports.createChat = catchAsync(async (req, res, next) => {
    const { orderId } = req.body;
    
    // Check if order exists
    const order = await Order.findById(orderId);
    if (!order) {
        return next(new AppError('Order not found', 404));
    }
    
    // Check if a chat already exists for this order
    const existingChat = await Chat.findOne({ orderId });
    if (existingChat) {
        return next(new AppError('Chat for this order already exists', 400));
    }
    
    // Create new chat
    const newChat = await Chat.create({
        freelancer: order.freelancerID,
        client: order.clientID,
        orderId: order._id,
        messages: []
    });
    
    // If socket.io is available, notify relevant users about new chat
    const io = req.app.get('socketio');
    if (io) {
        // Emit to both client and freelancer if they're online
        io.emit('new_chat', {
            chat: {
                _id: newChat._id,
                freelancer: newChat.freelancer,
                client: newChat.client,
                orderId: newChat.orderId,
                messages: [],
                lastActivity: newChat.lastActivity
            }
        });
    }
    
    res.status(201).json({
        status: 'success',
        data: {
            chat: newChat
        }
    });
});

// Get a chat by its ID
exports.getChat = catchAsync(async (req, res, next) => {
    const chat = await Chat.findById(req.params.id)
        .populate('freelancer', 'name email')
        .populate('client', 'name email')
        .populate('orderId');
    
    if (!chat) {
        return next(new AppError('Chat not found', 404));
    }
    
    res.status(200).json({
        status: 'success',
        data: {
            chat
        }
    });
});

// Get all chats for a user (either as client or freelancer)
exports.getUserChats = catchAsync(async (req, res, next) => {
    const userId = req.user._id;
    
    const chats = await Chat.find({
        $or: [
            { client: userId },
            { freelancer: userId }
        ]
    })
    .populate('freelancer', 'name email')
    .populate('client', 'name email')
    .populate('orderId')
    .sort('-lastActivity');
    
    res.status(200).json({
        status: 'success',
        results: chats.length,
        data: {
            chats
        }
    });
});

// Send a message (add to chat)
exports.sendMessage = catchAsync(async (req, res, next) => {
    const { content } = req.body;
    const chatId = req.params.id;
    const senderId = req.user._id;
    
    const chat = await Chat.findById(chatId);
    if (!chat) {
        return next(new AppError('Chat not found', 404));
    }
    
    // Verify the sender is either the client or freelancer
    if (chat.client.toString() !== senderId.toString() && 
        chat.freelancer.toString() !== senderId.toString()) {
        return next(new AppError('You are not authorized to send messages in this chat', 403));
    }
    
    // Create and add the new message
    const newMessage = {
        sender: senderId,
        content,
        timestamp: Date.now(),
        read: false
    };
    
    chat.messages.push(newMessage);
    chat.lastActivity = Date.now();
    await chat.save();
    
    // If socket.io is available, emit the new message
    const io = req.app.get('socketio');
    if (io) {
        io.to(chatId).emit('new_message', {
            chatId,
            message: newMessage
        });
        
        // Determine the recipient
        const recipientId = chat.client.toString() === senderId.toString() 
            ? chat.freelancer.toString() 
            : chat.client.toString();
            
        // Send a notification to the recipient (if they're not in the chat room)
        io.emit('message_notification', {
            chatId,
            senderId,
            recipientId,
            message: {
                content: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
                timestamp: newMessage.timestamp
            }
        });
    }
    
    res.status(201).json({
        status: 'success',
        data: {
            message: newMessage
        }
    });
});

// Mark all messages as read
exports.markMessagesAsRead = catchAsync(async (req, res, next) => {
    const chatId = req.params.id;
    const userId = req.user._id;
    
    const chat = await Chat.findById(chatId);
    if (!chat) {
        return next(new AppError('Chat not found', 404));
    }
    
    // Verify the user is either the client or freelancer
    if (chat.client.toString() !== userId.toString() && 
        chat.freelancer.toString() !== userId.toString()) {
        return next(new AppError('You are not authorized to access this chat', 403));
    }
    
    // Mark messages as read where the sender is not the current user
    let updated = false;
    chat.messages.forEach(msg => {
        if (msg.sender.toString() !== userId.toString() && !msg.read) {
            msg.read = true;
            updated = true;
        }
    });
    
    if (updated) {
        await chat.save();
        
        // If socket.io is available, emit read status
        const io = req.app.get('socketio');
        if (io) {
            io.to(chatId).emit('messages_read', {
                chatId,
                readBy: userId
            });
        }
    }
    
    res.status(200).json({
        status: 'success',
        message: 'Messages marked as read'
    });
}); 