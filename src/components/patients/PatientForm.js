import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { patientsAPI } from '../../services/api';
import ownersService from '../../services/owners';
import { Cat, Dog, Squirrel } from 'lucide-react';

const PatientForm = ({ initialData }) => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        type: initialData?.type || 'dog',
        breed: initialData?.breed || '',
        birthDate: initialData?.birthDate || '',
        weight: initialData?.weight || '',
        height: initialData?.height || '',
        temperature: initialData?.temperature || '',
        sex: initialData?.sex || '',
        owner: initialData?.owner || '', // Utiliser owner au lieu de ownerId
        lastVisit: initialData?.lastVisit || ''
    });
    const [owners, setOwners] = useState([]);
    const [loadingOwners, setLoadingOwners] = useState(true);

    useEffect(() => {
        const fetchOwners = async () => {
            try {
                const response = await ownersService.getAll();
                console.log('Owners response:', response.data);
                setOwners(response.data);
            } catch (error) {
                console.error('Error fetching owners:', error);
            } finally {
                setLoadingOwners(false);
            }
        };
        fetchOwners();
    }, []);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validation des données
        const requiredFields = ['name', 'type', 'breed', 'birthDate', 'weight', 'sex', 'owner'];
        const hasEmptyFields = requiredFields.some(field => !formData[field] || formData[field].trim() === '');

        if (hasEmptyFields) {
            alert('Please fill in all required fields');
            setLoading(false);
            return;
        }

        // Validation supplémentaire
        const validationErrors = [];

        // Vérifier le format de la date
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(formData.birthDate)) {
            validationErrors.push('Please enter a valid date format (YYYY-MM-DD)');
        }

        // Vérifier le type
        const validTypes = ['dog', 'cat', 'rabbit'];
        if (!validTypes.includes(formData.type)) {
            validationErrors.push('Invalid animal type');
        }

        // Vérifier le sexe
        const validSexes = ['male', 'female'];
        if (!validSexes.includes(formData.sex)) {
            validationErrors.push('Please select a valid sex (male or female)');
        }

        // Vérifier que l'owner est sélectionné
        if (!formData.owner) {
            validationErrors.push('Please select an owner');
        }

        if (validationErrors.length > 0) {
            alert(validationErrors.join('\n'));
            setLoading(false);
            return;
        }

        try {
            // Vérifier que les propriétaires sont chargés
            if (loadingOwners) {
                throw new Error('Loading owners... Please wait.');
            }

            // Vérifier et récupérer le propriétaire sélectionné
            console.log('Owners list:', owners);
            console.log('Selected owner ID:', formData.owner);
            const selectedOwner = owners.find(owner => {
                console.log('Comparing:', owner.id, typeof owner.id, 'with', formData.owner, typeof formData.owner);
                return String(owner.id) === String(formData.owner);
            });
            console.log('Found owner:', selectedOwner);
            if (!selectedOwner) {
                throw new Error('Please select a valid owner from the list');
            }

            // Créer le patient avec le bon format de données
            const patientData = {
                name: formData.name,
                type: formData.type,
                breed: formData.breed,
                birth_date: formData.birthDate,
                weight: formData.weight,
                sex: formData.sex,
                owner: selectedOwner.id  // Envoyer l'ID du propriétaire
            };

            console.log('Sending data:', patientData);
            
            if (id) {
                try {
                    console.log('Sending update data:', patientData);
                    console.log('Sending to endpoint:', `/patients/${id}/`);
                    const response = await patientsAPI.update(id, patientData);
                    console.log('Update response:', response);
                    navigate(`/patients/${id}`);
                } catch (error) {
                    console.error('Update error:', error);
                    console.error('Error details:', {
                        status: error.response?.status,
                        data: error.response?.data,
                        message: error.message
                    });
                    throw new Error('Failed to update patient: ' + (error.response?.data?.detail || error.message));
                }
            } else {
                try {
                    console.log('Sending create data:', patientData);
                    console.log('Sending to endpoint:', '/patients/');
                    const response = await patientsAPI.create(patientData);
                    console.log('Create response:', response);
                    navigate(`/patients/${response.id}`);
                } catch (error) {
                    console.error('Create error:', error);
                    throw new Error('Failed to create patient: ' + (error.response?.data?.detail || error.message));
                }
            }
        } catch (err) {
            setError(err.message || 'Failed to save patient');
        } finally {
            setLoading(false);
        }
    };

    const getAnimalIcon = (type) => {
        switch (type) {
            case 'dog':
                return <Dog className="h-6 w-6 text-amber-600" />;
            case 'cat':
                return <Cat className="h-6 w-6 text-gray-600" />;
            case 'rabbit':
                return <Squirrel className="h-6 w-6 text-brown-600" />;
            default:
                return <Squirrel className="h-6 w-6 text-gray-600" />;
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 mr-4">
                            {getAnimalIcon(formData.type)}
                        </div>
                        <div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                {id ? 'Edit Patient' : 'Create New Patient'}
                            </h3>
                        </div>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Name
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                                Type
                            </label>
                            <div className="mt-1">
                                <select
                                    name="type"
                                    id="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm"
                                    required
                                >
                                    <option value="dog">Dog</option>
                                    <option value="cat">Cat</option>
                                    <option value="rabbit">Rabbit</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="breed" className="block text-sm font-medium text-gray-700">
                                Breed
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="breed"
                                    id="breed"
                                    value={formData.breed}
                                    onChange={handleChange}
                                    className="bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">
                                Date of Birth
                            </label>
                            <div className="mt-1">
                                <input
                                    type="date"
                                    name="birthDate"
                                    id="birthDate"
                                    value={formData.birthDate}
                                    onChange={handleChange}
                                    className="bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
                                Weight (kg)
                            </label>
                            <div className="mt-1">
                                <input
                                    type="number"
                                    step="0.1"
                                    name="weight"
                                    id="weight"
                                    value={formData.weight}
                                    onChange={handleChange}
                                    className="bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="temperature" className="block text-sm font-medium text-gray-700">
                                Temperature (°C)
                            </label>
                            <div className="mt-1">
                                <input
                                    type="number"
                                    step="0.1"
                                    name="temperature"
                                    id="temperature"
                                    value={formData.temperature}
                                    onChange={handleChange}
                                    className="bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="sex" className="block text-sm font-medium text-gray-700">
                                Sex
                            </label>
                            <div className="mt-1">
                                <select
                                    name="sex"
                                    id="sex"
                                    value={formData.sex}
                                    onChange={handleChange}
                                    className="bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm"
                                    required
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="owner" className="block text-sm font-medium text-gray-700">
                                Owner
                            </label>
                            <div className="mt-1">
                                {loadingOwners ? (
                                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-teal-600 mx-auto"></div>
                                ) : (
                                    <select
                                        name="owner"
                                        id="owner"
                                        value={formData.owner}
                                        onChange={handleChange}
                                        className="bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm"
                                        required
                                    >
                                        <option value="">Select an owner</option>
                                        {owners.map(owner => (
                                            <option key={owner.id} value={owner.id}>
                                                {owner.first_name} {owner.last_name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="pt-5">
                        <div className="flex justify-end space-x-3 sm:space-x-4">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating...
                                    </>
                                ) : (
                                    'Create Patient'
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PatientForm;
