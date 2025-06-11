import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

// Fonctions de gestion des tokens
const TOKEN_KEY = 'vetcare_token';
const REFRESH_TOKEN_KEY = 'vetcare_refresh_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => token ? localStorage.setItem(TOKEN_KEY, token) : null;
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);
export const setRefreshToken = (token) => token ? localStorage.setItem(REFRESH_TOKEN_KEY, token) : null;
export const clearRefreshToken = () => localStorage.removeItem(REFRESH_TOKEN_KEY);

// Créer le contexte d'authentification
const AuthContext = createContext(null);

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Vérifier si l'utilisateur est authentifié
  const isAuthenticated = !!currentUser;

  // Vérifier si l'utilisateur a un rôle spécifique
  const hasRole = (role) => {
    if (!currentUser) return false;
    return currentUser.role === role;
  };

  // Vérifier si l'utilisateur a l'un des rôles spécifiés
  const hasAnyRole = (roles) => {
    if (!currentUser || !roles || roles.length === 0) return false;
    return roles.includes(currentUser.role);
  };

  // Charger l'utilisateur à partir du token
  const loadUser = async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return null;
    }

    try {
      const response = await authAPI.get('/auth/me/');
      setCurrentUser(response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors du chargement de l\'utilisateur:', error);
      logout();
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Se connecter
  const login = async (email, password) => {
    try {
      setError(null);
      const response = await authAPI.post('/auth/login/', { email, password });
      
      // Stocker les tokens
      const { token, refresh, user } = response.data;
      setToken(token);
      setRefreshToken(refresh);
      
      // Mettre à jour l'utilisateur connecté
      setCurrentUser(user);
      
      // Rediriger vers le tableau de bord
      navigate('/dashboard');
      
      return user;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setError(error.response?.data?.message || 'Échec de la connexion');
      throw error;
    }
  };

  // S'inscrire
  const register = async (userData) => {
    try {
      setError(null);
      const response = await authAPI.post('/auth/register/', userData);
      return response.data;
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      setError(error.response?.data?.message || 'Échec de l\'inscription');
      throw error;
    }
  };

  // Se déconnecter
  const logout = () => {
    clearToken();
    clearRefreshToken();
    setCurrentUser(null);
    navigate('/login');
  };

  // Rafraîchir le token
  const refreshToken = async () => {
    try {
      const refresh = getRefreshToken();
      if (!refresh) {
        throw new Error('Aucun refresh token disponible');
      }

      const response = await authAPI.post('/auth/token/refresh/', { refresh });
      const { access } = response.data;
      setToken(access);
      return access;
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du token:', error);
      logout();
      throw error;
    }
  };

  // Effet pour charger l'utilisateur au montage
  useEffect(() => {
    loadUser();
  }, []);

  // Configurer l'intercepteur pour gérer les tokens expirés
  useEffect(() => {
    const requestInterceptor = authAPI.interceptors.request.use(
      (config) => {
        const token = getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = authAPI.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // Si l'erreur est 401 et que ce n'est pas une tentative de rafraîchissement
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const newToken = await refreshToken();
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return authAPI(originalRequest);
          } catch (refreshError) {
            console.error('Impossible de rafraîchir le token:', refreshError);
            logout();
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );

    return () => {
      authAPI.interceptors.request.eject(requestInterceptor);
      authAPI.interceptors.response.eject(responseInterceptor);
    };
  }, [navigate]);

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    refreshToken,
    hasRole,
    hasAnyRole,
    loadUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;