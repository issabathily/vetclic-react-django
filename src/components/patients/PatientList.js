import React from 'react';
import { Link } from 'react-router-dom';
import { Cat, Dog, Squirrel, Edit, Trash2, Eye, Plus } from 'lucide-react';
import { usePatients } from '../../hooks/usePatients';

const PatientList = ({ searchQuery }) => {
  const { patients, loading, error } = usePatients();

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-12 text-red-500">{error}</div>;
  }

  // Filtrer les patients en fonction de la recherche
  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.owner.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getAnimalIcon = (type) => {
    switch (type) {
      case 'dog':
        return <Dog className="h-5 w-5 text-amber-600" />;
      case 'cat':
        return <Cat className="h-5 w-5 text-gray-600" />;
      case 'rabbit':
        return <Squirrel className="h-5 w-5 text-brown-600" />;
      default:
        return <Squirrel className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      {filteredPatients.length > 0 ? (
        <ul className="divide-y divide-gray-200">
          {filteredPatients.map((patient) => (
            <li key={patient.id}>
              <div className="px-4 py-4 flex items-center sm:px-6">
                <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                  <div className="truncate">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 mr-3">
                        {getAnimalIcon(patient.type)}
                      </div>
                      <div>
                        <div className="flex text-sm">
                          <p className="font-medium text-teal-600 truncate">{patient.name}</p>
                          <p className="ml-1 flex-shrink-0 font-normal text-gray-500">
                            • {patient.breed}
                          </p>
                        </div>
                        <div className="mt-2 flex">
                          <div className="flex items-center text-sm text-gray-500">
                            <p>
                              Owner: {patient.owner}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 flex space-x-4">
                          <div className="flex items-center text-sm text-gray-500">
                            <p>
                              Weight: {patient.weight} kg
                            </p>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <p>
                              Sex: {patient.sex}
                            </p>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <p>
                              Last Visit: {patient.lastVisit}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="ml-5 flex-shrink-0 flex space-x-2">
                  <Link 
                    to={`/patients/${patient.id}`}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                  >
                    <Eye className="h-5 w-5" />
                  </Link>
                  <Link 
                    to={`/patients/${patient.id}/edit`}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                  >
                    <Edit className="h-5 w-5" />
                  </Link>
                  <button
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No patients found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter to find what you're looking for.
          </p>
          <div className="mt-6">
            <Link
              to="/patients/new"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Add new patient
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientList;