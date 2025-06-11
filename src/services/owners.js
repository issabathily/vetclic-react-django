import { ownersAPI } from './api';

export const ownersService = {
    getAll: async () => {
        return ownersAPI.get('/owners/');
    },
    getOne: async (id) => {
        return ownersAPI.get(`/owners/${id}/`);
    },
    create: async (data) => {
        return ownersAPI.post('/owners/', data);
    },
    update: async (id, data) => {
        return ownersAPI.put(`/owners/${id}/`, data);
    },
    delete: async (id) => {
        return ownersAPI.delete(`/owners/${id}/`);
    },
    checkEmail: async (email) => {
        return ownersAPI.get(`/owners/check-email/?email=${encodeURIComponent(email)}`);
    }
};

export default ownersService;
