
import api from './index';


export const updateUser = async (name: String) => {
    try {
        const body = {
            name
        }
        const response = await api.post('/user/update', body);
        return response.data;
    } catch (error: any) {
        console.error('Update user failed:', error?.response?.data || error.message);
        throw error;
    }
};

export const fetchUserPFP = async (id: any) => {
    try {
        const response = await api.get(`/user/${id}/pfp`);
        return response.data;
    } catch (error: any) {
        console.error('Image fetch failed', error?.response?.data || error.message);
        throw error;
    }
};


export const getUser = async (id: any) => {
    try {
        const response = await api.get(`/user/${id}`);
        return response.data;
    } catch (error: any) {
        console.error('user fetch failed', error?.response?.data || error.message);
        throw error;
    }
};

export const getFreelancerEarnings = async () => {
    try {
        const response = await api.get(`/gigs/get/earnings`);
        return response.data;
    } catch (error: any) {
        console.error('earning fetch failed', error?.response?.data || error.message);
        throw error;
    }
}

