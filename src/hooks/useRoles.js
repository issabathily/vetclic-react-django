import { useState, useEffect } from 'react';
import { authAPI } from '../services/api';

export const useRoles = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchRoles = async () => {
        try {
            setLoading(true);
            // On pourrait avoir une API spécifique pour les rôles
            // Pour l'instant, on utilise l'API d'authentification
            const response = await authAPI.get('/auth/roles/');
            setRoles(response.data);
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to fetch roles');
        } finally {
            setLoading(false);
        }
    };

    // Récupérer les rôles au montage
    useEffect(() => {
        fetchRoles();
    }, []);

    const hasRole = (role) => {
        return roles.includes(role);
    };

    const hasAnyRole = (roles) => {
        return roles.some(role => hasRole(role));
    };

    return {
        roles,
        loading,
        error,
        hasRole,
        hasAnyRole
    };
};
