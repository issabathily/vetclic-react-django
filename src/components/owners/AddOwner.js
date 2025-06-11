import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOwnerCreate } from '../../hooks/useOwnerCreate';
import { Plus } from 'lucide-react';
import { ownersAPI } from '../../services/api';

const AddOwner = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        address: '',
    });
    const { loading, error, createOwner } = useOwnerCreate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation des données
        const requiredFields = ['first_name', 'last_name', 'email', 'phone', 'address'];
        const hasEmptyFields = requiredFields.some(field => !formData[field]?.trim());

        if (hasEmptyFields) {
            alert('Veuillez remplir tous les champs obligatoires');
            return;
        }


        try {
            // Vérifier si l'email existe déjà
            try {
                const response = await ownersAPI.get(`/owners/check_email/?email=${encodeURIComponent(formData.email)}`);
                if (response.data.exists) {
                    alert('Un propriétaire avec cet email existe déjà');
                    return;
                }
            } catch (error) {
                if (error.response?.status !== 400 && error.response?.status !== 404) {
                    console.error('Erreur lors de la vérification de l\'email:', error);
                    alert('Une erreur est survenue lors de la vérification de l\'email');
                    return;
                }
            }

            // Créer le propriétaire
            await createOwner(formData);
            navigate('/admin/owners');
        } catch (error) {
            console.error('Erreur lors de la création du propriétaire:', error);
            alert(error.response?.data?.message || 'Une erreur est survenue lors de la création du propriétaire');
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Ajouter un propriétaire</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                            Prénom *
                        </label>
                        <input
                            type="text"
                            id="first_name"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                            required
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                            Nom *
                        </label>
                        <input
                            type="text"
                            id="last_name"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                            required
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email *
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                            required
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                            Téléphone *
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                            required
                        />
                    </div>
                    
                    <div className="md:col-span-2">
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                            Adresse *
                        </label>
                        <input
                            type="text"
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                            required
                        />
                    </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Enregistrement...
                            </>
                        ) : (
                            <>
                                <Plus className="-ml-1 mr-2 h-4 w-4" />
                                Ajouter le propriétaire
                            </>
                        )}
                    </button>
                </div>
                
                {error && (
                    <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-400 rounded">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">
                                    {error}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
};

export default AddOwner;
