import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaUserPlus, FaUsers, FaPaw, FaSignOutAlt } from 'react-icons/fa';
import * as LucideIcons from 'lucide-react';

const ReceptionNavbar = ({ toggleSidebar }) => {
  const location = useLocation();
  
  const handleLogout = () => {
    // Implémentez la logique de déconnexion ici
    console.log('Déconnexion');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <LucideIcons.ClipboardList className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-800">Réception</span>
            </div>
            
            {/* Navigation principale */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/reception"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/reception')
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <FaHome className="mr-2" /> Tableau de bord
              </Link>
              <Link
                to="/reception/owners"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  location.pathname.startsWith('/reception/owners')
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <FaUsers className="mr-2" /> Propriétaires
              </Link>
              <Link
                to="/reception/patients"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  location.pathname.startsWith('/reception/patients')
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <FaPaw className="mr-2" /> Patients
              </Link>
             
            </div>
          </div>
          
          {/* Bouton de déconnexion */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaSignOutAlt className="mr-2" /> Déconnexion
            </button>
          </div>
          
          {/* Bouton menu mobile */}
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={toggleSidebar}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-expanded="false"
            >
              <span className="sr-only">Ouvrir le menu principal</span>
              <LucideIcons.Menu className="block h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default ReceptionNavbar;
