import axios from 'axios';

// Fonctions de gestion du token (à implémenter dans un fichier séparé si nécessaire)
const getToken = () => localStorage.getItem('vetcare_token');
const clearToken = () => localStorage.removeItem('vetcare_token');
const getRefreshToken = () => localStorage.getItem('vetcare_refreshToken');

// Créer une instance d'axios avec une configuration de base
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Timeout de 10 secondes
});

// Intercepteur pour ajouter le token d'authentification aux requêtes
api.interceptors.request.use(
  (config) => {
    // Ne pas ajouter le token pour les routes d'authentification
    if (config.url.includes('/auth/') && !config.url.includes('/auth/me/')) {
      return config;
    }
    
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les réponses et les erreurs
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Si l'erreur est 401 et que ce n'est pas une tentative de rafraîchissement
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Si c'est la page de login, on ne fait rien de spécial
      if (window.location.pathname === '/login') {
        return Promise.reject(error);
      }
      
      // Si on a déjà tenté de rafraîchir le token, on déconnecte l'utilisateur
      if (originalRequest._retry) {
        clearToken();
        window.location.href = '/login?session=expired';
        return Promise.reject(error);
      }
      
      // Tenter de rafraîchir le token
      originalRequest._retry = true;
      const refreshToken = getRefreshToken();
      
      if (refreshToken) {
        try {
          const response = await axios.post(
            `${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/auth/token/refresh/`,
            { refresh: refreshToken }
          );
          
          const { access } = response.data;
          // Mettre à jour le token dans le localStorage
          localStorage.setItem('vetcare_token', access);
          
          // Mettre à jour le header Authorization
          api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
          originalRequest.headers['Authorization'] = `Bearer ${access}`;
          
          // Renvoyer la requête originale avec le nouveau token
          return api(originalRequest);
        } catch (error) {
          // En cas d'échec du rafraîchissement, déconnecter l'utilisateur
          clearToken();
          window.location.href = '/login?session=expired';
          return Promise.reject(error);
        }
      } else {
        // Pas de refresh token disponible, déconnecter l'utilisateur
        clearToken();
        window.location.href = '/login?session=expired';
        return Promise.reject(error);
      }
    }
    
    // Gérer les autres types d'erreurs
    if (error.response) {
      // Erreurs 4xx et 5xx
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          // Erreur de validation
          return Promise.reject({
            status,
            message: data.message || 'Données invalides',
            errors: data.errors || {},
          });
          
        case 403:
          // Accès refusé
          return Promise.reject({
            status,
            message: data.message || 'Accès refusé',
          });
          
        case 404:
          // Ressource non trouvée
          return Promise.reject({
            status,
            message: data.message || 'Ressource non trouvée',
          });
          
        case 500:
          // Erreur serveur
          return Promise.reject({
            status,
            message: 'Une erreur est survenue sur le serveur',
          });
          
        default:
          // Autres erreurs
          return Promise.reject({
            status,
            message: data.message || 'Une erreur est survenue',
          });
      }
    } else if (error.request) {
      // La requête a été faite mais aucune réponse n'a été reçue
      return Promise.reject({
        status: 0,
        message: 'Impossible de se connecter au serveur',
      });
    } else {
      // Une erreur s'est produite lors de la configuration de la requête
      return Promise.reject({
        status: 0,
        message: error.message || 'Erreur de configuration de la requête',
      });
    }
  }
);

// Exporter l'instance API par défaut
export default api;

// Exporter des instances spécifiques pour différents services
export const authAPI = api;
export const ownersAPI = api;
export const patientsAPI = api;
