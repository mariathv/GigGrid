const mongoose = require("mongoose");

// Message Schema - embedded in Chat model
const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: [true, "Message must have a sender"]
    },
    content: {
        type: String,
        required: [true, "Message must have content"]
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    read: {
        type: Boolean,
        default: false
    }
});

// Chat Schema
const chatSchema = new mongoose.Schema({
    freelancer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: [true, "Chat must have a freelancer"]
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: [true, "Chat must have a client"]
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'orders',
        required: [true, "Chat must be associated with an order"]
    },
    lastActivity: {
        type: Date,
        default: Date.now
    },
    messages: [messageSchema]
});

// Update lastActivity whenever a new message is added
chatSchema.pre('save', function(next) {
    if (this.isModified('messages')) {
        this.lastActivity = Date.now();
    }
    next();
});

const Chat = mongoose.model("chat", chatSchema, "chat");

module.exports = Chat; 