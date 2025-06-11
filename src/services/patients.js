import { api } from './api';

export const patientsAPI = {
    // CRUD pour les patients
    create: async (data) => {
        return api.post('/patients/', data);
    },
    getAll: async () => {
        return api.get('/patients/');
    },
    getOne: async (id) => {
        return api.get(`/patients/${id}/`);
    },
    update: async (id, data) => {
        return api.put(`/patients/${id}/`, data);
    },
    delete: async (id) => {
        return api.delete(`/patients/${id}/`);
    },

    // Spécifique aux vétérinaires
    updateMedicalRecord: async (id, data) => {
        return api.put(`/patients/${id}/medical-record/`, data);
    },

    // Spécifique aux administrateurs
    assignOwner: async (patientId, ownerId) => {
        return api.post(`/patients/${patientId}/assign-owner/`, { owner: ownerId });
    },

    // Recherche de patients
    search: async (query) => {
        return api.get('/patients/search/', { params: { query } });
    }
};
