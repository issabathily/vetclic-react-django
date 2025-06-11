import { useState, useEffect } from 'react';
import { patientsAPI } from '../services/api';

export const usePatients = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPatients = async () => {
        try {
            setLoading(true);
            const data = await patientsAPI.getAll();
            setPatients(data);
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to fetch patients');
        } finally {
            setLoading(false);
        }
    };

    // Récupérer les patients au montage
    useEffect(() => {
        fetchPatients();
    }, []);

    const createPatient = async (patientData) => {
        try {
            setLoading(true);
            const newPatient = await patientsAPI.create(patientData);
            setPatients([...patients, newPatient]);
            return newPatient;
        } catch (err) {
            setError(err.message || 'Failed to create patient');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updatePatient = async (id, patientData) => {
        try {
            setLoading(true);
            const updatedPatient = await patientsAPI.update(id, patientData);
            setPatients(patients.map(patient => patient.id === id ? updatedPatient : patient));
            return updatedPatient;
        } catch (err) {
            setError(err.message || 'Failed to update patient');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deletePatient = async (id) => {
        try {
            setLoading(true);
            await patientsAPI.delete(id);
            setPatients(patients.filter(patient => patient.id !== id));
        } catch (err) {
            setError(err.message || 'Failed to delete patient');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        patients,
        loading,
        error,
        fetchPatients,
        createPatient,
        updatePatient,
        deletePatient
    };
};
