import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';

const VetNavbar = ({ toggleSidebar }) => {
  const location = useLocation();
  
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
              <LucideIcons.Stethoscope className="h-8 w-8 text-purple-600" />
              <span className="ml-2 text-xl font-bold text-gray-800">VetCare</span>
            </div>
            
            {/* Navigation principale */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/vet"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/vet')
                    ? 'border-purple-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Tableau de bord
              </Link>
              <Link
                to="/vet/patients"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  location.pathname.startsWith('/vet/patients')
                    ? 'border-purple-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Patients
              </Link>
              <Link
                to="/vet/appointments"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  location.pathname.startsWith('/vet/appointments')
                    ? 'border-purple-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Rendez-vous
              </Link>
            </div>
          </div>
          
          {/* Bouton mobile */}
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={toggleSidebar}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
              aria-expanded="false"
            >
              <span className="sr-only">Ouvrir le menu principal</span>
              <LucideIcons.Menu className="block h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default VetNavbar;
