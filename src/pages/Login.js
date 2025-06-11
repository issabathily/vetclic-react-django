// Import des dépendances nécessaires
import React, { useState } from 'react';
import { Stethoscope, Shield, Users } from 'lucide-react';
import { useAlert } from '../hooks/useAlert';
import { useAuth } from '../contexts/AuthContext';

// Composant principal de la page de connexion
const Login = () => {
  // États du composant
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ username: '', password: '' });
  const [selectedRole, setSelectedRole] = useState('administrator');

  // Définition des rôles disponibles
  const roles = [
    { value: 'administrator', label: 'Administrateur', icon: <Shield className="h-5 w-5 text-teal-500" /> },
    { value: 'veterinarian', label: 'Vétérinaire', icon: <Stethoscope className="h-5 w-5 text-teal-500" /> },
    { value: 'receptionist', label: 'Réceptionniste', icon: <Users className="h-5 w-5 text-teal-500" /> }
  ];

  // Gestion du changement de rôle
  const handleRoleChange = (role) => {
    setSelectedRole(role);
  };

  // Fonctions de validation
  const validateUsername = (value) => value.length >= 3;
  const validatePassword = (value) => value.length >= 6;

  // Hooks utilisés
  const { login } = useAuth();
  const { addAlert } = useAlert();

  // Fonction de connexion rapide
  const handleQuickLogin = (role) => {
    // Identifiants par défaut pour chaque rôle
    const credentials = {
      administrator: { username: 'admin', password: 'admin123' },
      veterinarian: { username: 'vet', password: 'vet123' },
      receptionist: { username: 'reception', password: 'reception123' }
    };

    // Récupération des identifiants pour le rôle sélectionné
    const { username, password } = credentials[role];
    setUsername(username);
    setPassword(password);

    // Soumission automatique du formulaire
    handleSubmit({ preventDefault: () => {} });
  };

  // Validation du formulaire
  const validateForm = () => {
    const newErrors = { username: '', password: '' };
    let isValid = true;

    // Validation du nom d'utilisateur
    if (!username) {
      newErrors.username = 'Le nom d\'utilisateur est requis';
      isValid = false;
    } else if (!validateUsername(username)) {
      newErrors.username = 'Le nom d\'utilisateur doit contenir au moins 3 caractères';
      isValid = false;
    }

    // Validation du mot de passe
    if (!password) {
      newErrors.password = 'Le mot de passe est requis';
      isValid = false;
    } else if (!validatePassword(password)) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      await login(username, password);
      // Redirection basée sur le rôle après la connexion réussie
      // Le rôle sera récupéré depuis le backend
      if (selectedRole === 'administrator') {
        window.location.href = '/admin';
      } else if (selectedRole === 'veterinarian') {
        window.location.href = '/vet';
      } else {
        window.location.href = '/reception';
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      addAlert(error.message || 'Erreur lors de la connexion', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-black/80 rounded-2xl backdrop-blur-sm">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-teal-500">VetCare Management</h2>
          <p className="mt-2 text-sm text-gray-400">Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300">
              Username
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full px-4 py-2 rounded-md bg-white border border-gray-700 text-gray-700 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Enter your username"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-400">{errors.username}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-300">
              Role
            </label>
            <div className="mt-1">
              <select
                id="role"
                value={selectedRole}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="block w-full px-4 py-2 rounded-md bg-white border border-gray-700 text-gray-700 focus:ring-teal-500 focus:border-teal-500"
              >
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              Password
            </label>
            <div className="mt-1">
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-4 py-2 rounded-md bg-white border border-gray-700 text-gray-700 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="mt-4 text-center">
            <h3 className="text-sm font-medium text-gray-900">Quick Login</h3>
            <div className="mt-2 space-y-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('administrator')}
                className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-teal-500" />
                  <span>Administrator</span>
                </div>
                <span className="text-xs text-gray-500">Manage all patients and owners</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('veterinarian')}
                className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <Stethoscope className="h-5 w-5 text-teal-500" />
                  <span>Veterinarian</span>
                </div>
                <span className="text-xs text-gray-500">Manage patients and medical records</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('receptionist')}
                className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-teal-500" />
                  <span>Receptionist</span>
                </div>
                <span className="text-xs text-gray-500">Manage patients and owners</span>
              </button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don\'t have an account?{' '}
              <a href="/register" className="font-medium text-teal-600 hover:text-teal-500">
                Create an account
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;