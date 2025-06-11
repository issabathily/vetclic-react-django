import { api } from './api';

export const authAPI = {
    login: async (credentials) => {
        return api.post('/auth/login/', credentials);
    },
    register: async (userData) => {
        return api.post('/auth/register/', userData);
    },
    refreshToken: async () => {
        return api.post('/auth/refresh/', {
            refresh: localStorage.getItem('vetcare_refresh_token')
        });
    },
    logout: async () => {
        return api.post('/auth/logout/', null, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('vetcare_token')}`
            }
        });
    },
    getCurrentUser: async () => {
        return api.get('/auth/user/');
    },
    createUser: async (userData) => {
        return api.post('/auth/users/', userData);
    }
};
