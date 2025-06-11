import { useState, useEffect } from 'react';
import { ownersAPI } from '../services/api';

export const useOwnerDetail = (ownerId) => {
    const [owner, setOwner] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchOwner = async () => {
        try {
            setLoading(true);
            const data = await ownersAPI.getOne(ownerId);
            setOwner(data);
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to fetch owner details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (ownerId) {
            fetchOwner();
        }
    }, [ownerId]);

    const updateOwner = async (ownerData) => {
        try {
            setLoading(true);
            const updatedOwner = await ownersAPI.update(ownerId, ownerData);
            setOwner(updatedOwner);
            return updatedOwner;
        } catch (err) {
            setError(err.message || 'Failed to update owner');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        owner,
        loading,
        error,
        fetchOwner,
        updateOwner
    };
};
