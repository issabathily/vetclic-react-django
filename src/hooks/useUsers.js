import { useState, useEffect } from 'react';
import { authAPI } from '../services/api';

export const useUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await authAPI.get('/auth/users/');
            setUsers(response.data);
            setError(null);
        } catch (err) {
            setError(err.message || 'Échec du chargement des utilisateurs');
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const createUser = async (userData) => {
        try {
            setLoading(true);
            const response = await authAPI.post('/auth/register/', userData);
            setUsers(prevUsers => [...prevUsers, response.data]);
            return response.data;
        } catch (err) {
            console.error('Error creating user:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateUser = async (id, userData) => {
        try {
            setLoading(true);
            const response = await authAPI.put(`/auth/users/${id}/`, userData);
            setUsers(prevUsers => 
                prevUsers.map(user => user.id === id ? response.data : user)
            );
            return response.data;
        } catch (err) {
            console.error('Error updating user:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteUser = async (id) => {
        try {
            setLoading(true);
            await authAPI.delete(`/auth/users/${id}/`);
            setUsers(prevUsers => prevUsers.filter(user => user.id !== id));
        } catch (err) {
            console.error('Error deleting user:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        users,
        loading,
        error,
        fetchUsers,
        createUser,
        updateUser,
        deleteUser
    };
};
