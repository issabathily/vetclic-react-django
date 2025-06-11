import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Edit, Mail, Phone, MapPin, Cat, Dog, Squirrel, Plus } from 'lucide-react';
import { useOwnerDetail } from '../hooks/useOwnerDetail';

function OwnerDetail() {
  const { id } = useParams();
  const { owner, loading, error } = useOwnerDetail(id);

  const getAnimalIcon = (type) => {
    switch (type) {
      case 'dog':
        return <Dog className="h-5 w-5 text-amber-600" />;
      case 'cat':
        return <Cat className="h-5 w-5 text-gray-600" />;
      case 'rabbit':
        // Pas d'icône lapin dans lucide-react, utiliser Squirrel comme substitution
        return <Squirrel className="h-5 w-5 text-yellow-700" />;
      default:
        return <Squirrel className="h-5 w-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
        <Link to="/owners" className="inline-flex items-center text-teal-600 hover:text-teal-900">
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back to Owners
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Retour à la liste des propriétaires */}
      <div className="mb-6">
        <Link to="/owners" className="inline-flex items-center text-teal-600 hover:text-teal-900">
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back to Owners
        </Link>
      </div>

      {/* Détails du propriétaire */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6 flex justify-between">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Owner Details</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal information and pets.</p>
          </div>
          <Link to={`/owners/${id}/edit`} className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-teal-700 bg-teal-100 hover:bg-teal-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Link>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Full name</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{owner.name}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Email address</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-gray-400 mr-2" />
                  <a href={`mailto:${owner.email}`} className="text-teal-600 hover:text-teal-900">{owner.email}</a>
                </div>
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Phone number</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-gray-400 mr-2" />
                  <a href={`tel:${owner.phone}`} className="text-teal-600 hover:text-teal-900">{owner.phone}</a>
                </div>
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Address</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                  {owner.address}
                </div>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Liste des animaux */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Pets</h3>
          <Link
            to="/patients/new"
            state={{ ownerId: id }}
            className="inline-flex items-center rounded-md border border-transparent bg-teal-600 px-3 py-1 text-sm font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Pet
          </Link>
        </div>
        {!owner?.pets?.length ? (
          <p className="px-4 pb-6 text-sm text-gray-500">No pets found for this owner.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {owner.pets.map((pet) => (
              <li key={pet.id} className="px-4 py-4 flex items-center justify-between sm:px-6">
                <div className="flex items-center space-x-4">
                  {getAnimalIcon(pet.type)}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{pet.name}</p>
                    <p className="text-sm text-gray-500">{pet.breed}</p>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <p>Birth: {formatDate(pet.birthDate)}</p>
                  <p>Last Visit: {formatDate(pet.lastVisit)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// Utilitaire pour afficher une date lisible
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default OwnerDetail;
