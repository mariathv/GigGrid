import api from './index';
import { registerForPushNotificationsAsync } from "./expo-notifications/notif";

export const getMyRecentOrders_Client = async () => {
    try {
        const response = await api.get('orders/client?limit=3');
        return response.data;
    } catch (error: any) {
        console.error('get orders failed:', error?.response?.data || error.message);
        throw error;
    }
}

export const getAllMyOrders_Client = async () => {
    try {
        const response = await api.get('orders/client');
        return response.data;
    } catch (error: any) {
        console.error('get orders failed:', error?.response?.data || error.message);
        throw error;
    }
}

export const getMyRecentOrders_Freelancer = async () => {
    try {
        const response = await api.get('orders/freelancer?limit=3');
        return response.data;
    } catch (error: any) {
        console.error('get orders failed:', error?.response?.data || error.message);
        throw error;
    }
}

export const getAllMyOrders_Freelancer = async () => {
    try {
        const response = await api.get('orders/freelancer');
        return response.data;
    } catch (error: any) {
        console.error('get orders failed:', error?.response?.data || error.message);
        throw error;
    }
}

export const createOrder = async (gigID: string, selectedPackage: string) => {
    try {
        // Get the client's push token
        const clientExpoPushToken = await registerForPushNotificationsAsync();

        const response = await api.post('orders', {
            gigID,
            selectedPackage,
            clientExpoPushToken
        });
        return response.data;
    } catch (error: any) {
        console.error('Create order failed:', error?.response?.data || error.message);
        throw error;
    }
};

export const confirmOrder = async (orderId: string, completionLink: string) => {
    try {
        const response = await api.patch(`orders/${orderId}/confirm`, { completionLink });
        return response.data;
    } catch (error: any) {
        console.error('confirm order failed:', error?.response?.data || error.message);
        throw error;
    }
};


export const cancelOrder = async (orderId: string) => {
    try {
        const response = await api.patch(`orders/${orderId}/cancel`);
        return response.data;
    } catch (error: any) {
        console.error("Cancel order failed:", error?.response?.data || error.message);
        throw error;
    }
};


export const getOrderById = async (orderId: string) => {
    try {
        const response = await api.get(`orders/${orderId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching order details:", error)
        throw error
    }
}