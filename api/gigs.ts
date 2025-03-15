
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

export const getMyGigs = async () => {
    try {
        const response = await api.get('/gigs/getmygigs');
        return response.data;
    } catch (error: any) {
        console.error('get gigs failed:', error?.response?.data || error.message);
        throw error;
    }
}

export const getGig = async (id: any) => {
    try {
        const response = await api.get(`/gigs/${id}`);
        return response.data;
    } catch (error: any) {
        console.error('get gig failed:', error?.response?.data || error.message);
        throw error;
    }
}

export const updateGig = async (gigData: GigData) => {
    try {
        const response = await api.post(`/gigs/update/${gigData._id}`, gigData);
        return response.data;
    } catch (error: any) {
        console.error('Update gig failed:', error?.response?.data || error.message);
        throw error;
    }
}

export const deleteGig = async (id: any) => {
    try {
        const response = await api.delete(`/gigs/${id}`);
        return response.data;
    } catch (error: any) {
        console.error('delete gig failed:', error?.response?.data || error.message);
        throw error;
    }
}
