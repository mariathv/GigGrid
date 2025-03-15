
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