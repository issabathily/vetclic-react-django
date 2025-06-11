import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import useAuth from '../../hooks/useAuth';

const Sidebar = ({ isOpen, closeSidebar }) => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };
  
  const navigation = [
    { name: 'Dashboard', icon: 'Home', href: '/', allowedRoles: ['administrator', 'veterinarian', 'receptionist'], iconColor: 'text-blue-500' },
    { name: 'Owners', icon: 'Users', href: '/owners', allowedRoles: ['administrator', 'veterinarian', 'receptionist'], iconColor: 'text-purple-500' },
    { name: 'Patients', icon: 'Stethoscope', href: '/patients', allowedRoles: ['administrator', 'veterinarian', 'receptionist'], iconColor: 'text-green-500' },
    { name: 'Settings', icon: 'Settings', href: '/settings', allowedRoles: ['administrator'], iconColor: 'text-teal-500' }
  ];

  // Fonction pour obtenir l'icône correspondante
  const getIcon = (iconName) => {
    switch (iconName) {
      case 'Home':
        return 'Home';
      case 'Users':
        return 'Users';
      case 'Stethoscope':
        return 'Stethoscope';
      case 'Calendar':
        return 'Calendar';
      case 'ClipboardList':
        return 'ClipboardList';
      case 'Shield':
        return 'Shield';
      case 'Settings':
        return 'Settings';
      default:
        return 'Home';
    }
  };

  // Fonction pour obtenir le libellé du rôle
  const getRoleLabel = (role) => {
    const roles = {
      'administrator': 'Administrateur',
      'veterinarian': 'Vétérinaire',
      'receptionist': 'Réceptionniste'
    };
    return roles[role] || role;
  };

  const filteredNavigation = navigation.filter(item => 
    !user?.role || item.allowedRoles.includes(user.role)
  );

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-gray-900 bg-opacity-50 md:hidden"
          onClick={closeSidebar}
        />
      )}
      
      {/* Sidebar */}
      <div className="h-screen flex flex-col bg-white border-r border-gray-200">
        {/* Mobile close button */}
        <div className="px-4 py-3 flex items-center justify-between md:hidden">
          <div className="flex items-center">
            <LucideIcons.Stethoscope className="h-8 w-8 text-purple-500" />
            <span className="ml-2 text-xl font-bold text-gray-700">VetCare</span>
          </div>
          <button
            onClick={closeSidebar}
            className="rounded-md p-2 text-purple-500 hover:bg-purple-50 hover:text-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-200"
            aria-label="Fermer le menu latéral"
          >
            <LucideIcons.X className="h-6 w-6" />
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-2 space-y-1">
            {filteredNavigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className="flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors duration-150 ease-in-out text-gray-700 hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus:bg-gray-100 focus:text-gray-800 mx-2"
                role="button"
                tabIndex={0}
                onClick={() => {
                  if (window.innerWidth < 768) {
                    closeSidebar();
                  }
                }}
              >
                {React.createElement(LucideIcons[getIcon(item.icon)], { className: `mr-3 h-5 w-5 ${item.iconColor}` })}
                {item.name}
              </NavLink>
            ))}
          </div>
        </nav>
        
        {/* Bottom section */}
        <div className="flex-shrink-0 border-t border-gray-200 bg-gray-50">
          <NavLink
            to="/help"
            className="flex items-center px-6 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          >
            <LucideIcons.AlertCircle className="mr-3 h-5 w-5 text-gray-500" />
            Aide & Support
          </NavLink>
          
          {user && (
            <div className="px-6 py-3 border-t border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <LucideIcons.User className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
                <div className="ml-3 overflow-hidden">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {getRoleLabel(user.role)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;