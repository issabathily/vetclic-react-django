import { useState } from 'react';
import { ownersAPI } from '../services/api';

export const useOwnerCreate = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const createOwner = async (ownerData) => {
        try {
            setLoading(true);
            setError(null);
            console.log('Creating owner with data:', ownerData);
            console.log('Auth token:', localStorage.getItem('vetcare_token'));
            const createdOwner = await ownersAPI.create(ownerData);
            console.log('Created owner:', createdOwner);
            return createdOwner;
        } catch (err) {
            setError(err.message || 'Failed to create owner');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        createOwner
    };
};
