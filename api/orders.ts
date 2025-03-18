import api from './index';

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

export const placeGigOrder = async (bodyData: any) => {
    try {
        const response = await api.post('orders/', bodyData);
        return response.data;
    } catch (error: any) {
        console.error('create order failed:', error?.response?.data || error.message);
        throw error;
    }
}