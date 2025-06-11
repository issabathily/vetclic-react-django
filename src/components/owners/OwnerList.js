import React from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Eye, Plus } from 'lucide-react';
import { useOwners } from '../../hooks/useOwners';

const OwnerList = () => {
  const { owners, loading, error } = useOwners();

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-12 text-red-500">{error}</div>;
  }

  // Filtrer les owners en fonction de la recherche
  const filteredOwners = owners.filter(owner => 
    (owner.first_name + ' ' + owner.last_name).toLowerCase().includes("") ||
    owner.email.toLowerCase().includes("") ||
    owner.phone.includes("")
  );

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <div className="px-4 py-4 sm:px-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Owners</h2>
          <Link
            to="/admin/"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Admin
          </Link>
        </div>
      </div>
      {filteredOwners.length > 0 ? (
        <ul className="divide-y divide-gray-200">
          {filteredOwners.map((owner) => (
            <li key={owner.id}>
              <div className="px-4 py-4 flex items-center sm:px-6">
                <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                  <div className="truncate">
                    <div className="flex text-sm">
                      <p className="font-medium text-teal-600 truncate">{owner.name}</p>
                    </div>
                    <div className="mt-2 flex">
                      <div className="flex items-center text-sm text-gray-500">
                        <p>
                          Email: {owner.email}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex">
                      <div className="flex items-center text-sm text-gray-500">
                        <p>
                          Phone: {owner.phone}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex">
                      <div className="flex items-center text-sm text-gray-500">
                        <p className="truncate">
                          Address: {owner.address}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5">
                    <div className="flex -space-x-1 overflow-hidden">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                        {owner.pets} pet{owner.pets !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="ml-5 flex-shrink-0 flex space-x-2">
                  <Link 
                    to={`/owners/${owner.id}`}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                  >
                    <Eye className="h-5 w-5" />
                  </Link>
                  <Link 
                    to={`/owners/${owner.id}/edit`}
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
          <h3 className="mt-2 text-sm font-medium text-gray-900">No owners found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter to find what you're looking for.
          </p>
          <div className="mt-6">
            <Link
              to="/owners/new"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Add new owner
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerList;