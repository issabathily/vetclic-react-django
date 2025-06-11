import { useState, useEffect } from 'react';
import { patientsAPI } from '../services/api';

export const usePatientDetail = (patientId) => {
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPatient = async () => {
        try {
            setLoading(true);
            const data = await patientsAPI.getOne(patientId);
            setPatient(data);
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to fetch patient details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (patientId) {
            fetchPatient();
        }
    }, [patientId]);

    const updatePatient = async (patientData) => {
        try {
            setLoading(true);
            const updatedPatient = await patientsAPI.update(patientId, patientData);
            setPatient(updatedPatient);
            return updatedPatient;
        } catch (err) {
            setError(err.message || 'Failed to update patient');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deletePatient = async () => {
        try {
            setLoading(true);
            await patientsAPI.delete(patientId);
            return true;
        } catch (err) {
            setError(err.message || 'Failed to delete patient');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        patient,
        loading,
        error,
        fetchPatient,
        updatePatient,
        deletePatient
    };
};
