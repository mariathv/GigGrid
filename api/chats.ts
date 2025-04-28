import api from './index'

// Type definitions based on backend models
export interface Message {
    _id?: string;
    sender: string;
    content: string;
    timestamp: string;
    read: boolean;
}

export interface Chat {
    _id: string;
    freelancer: {
        _id: string;
        name: string;
        email: string;
    };
    client: {
        _id: string;
        name: string;
        email: string;
    };
    orderId: {
        _id: string;
        gig?: {
            title: string;
        };
    };
    messages: Message[];
    lastActivity: string;
}

// Get all chats for the current user
export const getUserChats = async () => {
    try {
        const response = await api.get('chats/my-chats');
        return response.data;
    } catch (error: any) {
        console.error('Get user chats failed:', error?.response?.data || error.message);
        throw error;
    }
};

// Get a specific chat by ID
export const getChatById = async (chatId: string) => {
    try {
        const response = await api.get(`chats/${chatId}`);
        return response.data;
    } catch (error: any) {
        console.error('Get chat failed:', error?.response?.data || error.message);
        throw error;
    }
};

// Send a message in a chat
export const sendMessage = async (chatId: string, content: string) => {
    try {
        const response = await api.post(`chats/${chatId}`, { content });
        return response.data;
    } catch (error: any) {
        console.error('Send message failed:', error?.response?.data || error.message);
        throw error;
    }
};

// Mark all messages in a chat as read
export const markMessagesAsRead = async (chatId: string) => {
    try {
        const response = await api.patch(`chats/${chatId}/read`);
        return response.data;
    } catch (error: any) {
        console.error('Mark messages as read failed:', error?.response?.data || error.message);
        throw error;
    }
};

// Create a new chat for an order
export const createChat = async (orderId: string) => {
    try {
        const response = await api.post('chats', { orderId });
        return response.data;
    } catch (error: any) {
        console.error('Create chat failed:', error?.response?.data || error.message);
        throw error;
    }
}; 