import React from 'react';
import { Link } from 'react-router-dom';
import { useOwners } from '../../hooks/useOwners';

const RecentOwners = () => {
  const { owners, loading, error } = useOwners();

  // Trier les owners par date de création (descendant)
  const sortedOwners = owners.sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );
  // Prendre les 5 plus récents
  const recentOwners = sortedOwners.slice(0, 5);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contact
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Pets
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {recentOwners.map((owner) => (
            <tr key={owner.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{owner.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{owner.email}</div>
                <div className="text-sm text-gray-500">{owner.phone}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{owner.pets || 0} pet{owner.pets !== 1 ? 's' : ''}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <Link 
                  to={`/owners/${owner.id}`} 
                  className="text-indigo-600 hover:text-indigo-900 hover:underline mr-4"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="py-3 flex justify-center bg-white border-t border-gray-200">
        <Link 
          to="/owners" 
          className="text-sm font-medium text-indigo-600 hover:text-indigo-900 hover:underline"
        >
          View all owners →
        </Link>
      </div>
    </div>
  );
};

export default RecentOwners;