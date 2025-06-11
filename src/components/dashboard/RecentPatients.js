import React from 'react';
import { Link } from 'react-router-dom';
import { Cat, Dog, Squirrel } from 'lucide-react';
import { usePatients } from '../../hooks/usePatients';

const RecentPatients = () => {
  const { patients, loading, error } = usePatients();

  // Trier les patients par date de dernière visite (descendant)
  const sortedPatients = patients.sort((a, b) =>
    new Date(b.lastVisit) - new Date(a.lastVisit)
  );
  // Prendre les 5 plus récents
  const recentPatients = sortedPatients.slice(0, 5);

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
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-black">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Pet
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Owner
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Visit
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-black">
          {recentPatients.map((patient) => (
            <tr key={patient.id} className="hover:bg-black/80">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {getAnimalIcon(patient.type)}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                    <div className="text-sm text-gray-500 capitalize">{patient.type} • {patient.breed}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{patient.owner}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{patient.date}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <Link to={`/patients/${patient.id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="py-3 flex justify-center">
        <Link to="/patients" className="text-sm text-blue-600 hover:text-blue-900">
          View all patients →
        </Link>
      </div>
    </div>
  );
};

export default RecentPatients;