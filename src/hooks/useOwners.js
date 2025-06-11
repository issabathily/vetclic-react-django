import { useState, useEffect } from 'react';
import { ownersAPI } from '../services/api';

export const useOwners = () => {
    const [owners, setOwners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchOwners = async () => {
        try {
            setLoading(true);
            const data = await ownersAPI.getAll();
            console.log('Fetched owners:', data);
            if (Array.isArray(data)) {
                const validOwners = data.filter(owner => 
                    owner && 
                    typeof owner.id === 'number' &&
                    typeof owner.first_name === 'string' &&
                    typeof owner.last_name === 'string' &&
                    typeof owner.email === 'string' &&
                    typeof owner.phone === 'string'
                );
                setOwners(validOwners);
                setError(null);
            } else {
                setError('Invalid owners data format');
            }
        } catch (err) {
            setError(err.message || 'Failed to fetch owners');
        } finally {
            setLoading(false);
        }
    };

    // Récupérer les owners au montage
    useEffect(() => {
        fetchOwners();
    }, []);

    const createOwner = async (ownerData) => {
        try {
            setLoading(true);
            const newOwner = await ownersAPI.create(ownerData);
            setOwners([...owners, newOwner]);
            return newOwner;
        } catch (err) {
            setError(err.message || 'Failed to create owner');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateOwner = async (id, ownerData) => {
        try {
            setLoading(true);
            const updatedOwner = await ownersAPI.update(id, ownerData);
            setOwners(owners.map(owner => owner.id === id ? updatedOwner : owner));
            return updatedOwner;
        } catch (err) {
            setError(err.message || 'Failed to update owner');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteOwner = async (id) => {
        try {
            setLoading(true);
            await ownersAPI.delete(id);
            setOwners(owners.filter(owner => owner.id !== id));
        } catch (err) {
            setError(err.message || 'Failed to delete owner');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        owners,
        loading,
        error,
        fetchOwners,
        createOwner,
        updateOwner,
        deleteOwner
    };
};
