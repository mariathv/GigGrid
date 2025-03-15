// src/api/index.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
});

let latestToken: string | null = null;

export const setGlobalAuthToken = (token: string | null) => {
    latestToken = token;
};

api.interceptors.request.use(
    async (config) => {
        const tokenToUse = latestToken || await AsyncStorage.getItem('auth_token');
        if (tokenToUse) {
            config.headers.Authorization = `Bearer ${tokenToUse}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API error:', error?.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default api;
