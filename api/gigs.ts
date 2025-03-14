
import api from './index';
import { GigData } from '@/types/gigs';

export const addGig = async (gigData: GigData) => {
    try {
        const response = await api.post('/gigs/add', gigData);
        return response.data;
    } catch (error: any) {
        console.error('Add gig failed:', error?.response?.data || error.message);
        throw error;
    }
};
