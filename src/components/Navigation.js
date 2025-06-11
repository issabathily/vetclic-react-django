import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const Navigation = () => {
  const { user, logout, loading } = useAuth();
  
  // Supprimer cette condition car elle est maintenant gérée plus bas

  // Définir les rôles valides
  const validRoles = ['administrator', 'veterinarian', 'receptionist'];

  // Gérer le chargement et les erreurs
  if (loading) {
    return (
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex items-center">
                <span className="text-xl font-bold text-teal-600">VetCare</span>
              </Link>
            </div>
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-teal-500"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Gérer les cas où l'utilisateur n'est pas connecté ou n'a pas de rôle valide
  if (!user || !user.role || !validRoles.includes(user.role)) {
    return (
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex items-center">
                <span className="text-xl font-bold text-teal-600">VetCare</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-teal-600 hover:text-teal-500">Login</Link>
              <Link to="/register" className="text-teal-600 hover:text-teal-500">Register</Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Définir les liens de navigation selon le rôle
  const navItems = {
    administrator: [
      { path: '/admin/dashboard', label: 'Dashboard' },
      { path: '/admin/users', label: 'Utilisateurs' },
      { path: '/admin/settings', label: 'Paramètres' }
    ],
    veterinarian: [
      { path: '/vet/dashboard', label: 'Dashboard' },
      { path: '/vet/patients', label: 'Patients' },
      { path: '/vet/appointments', label: 'Rendez-vous' }
    ],
    receptionist: [
      { path: '/reception/dashboard', label: 'Dashboard' },
      { path: '/reception/appointments', label: 'Rendez-vous' },
      { path: '/reception/clients', label: 'Clients' }
    ]
  };

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-teal-600">VetCare</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex space-x-4">
              {navItems[user.role].map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="px-3 py-2 text-teal-600 hover:text-teal-500"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 text-teal-600 hover:text-teal-500"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
