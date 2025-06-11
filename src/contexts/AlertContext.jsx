import React, { createContext, useState, useEffect } from 'react';

const AlertContext = createContext({
  alerts: [],
  addAlert: () => {},
  removeAlert: () => {},
  error: null,
});

const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);
  const [error, setError] = useState(null);

  const addAlert = (type, message) => {
    try {
      const id = Date.now();
      const newAlert = {
        id,
        type,
        message,
        timestamp: Date.now(),
      };
      setAlerts(prev => [...prev, newAlert]);

      // Auto-remove after 5 seconds
      setTimeout(() => removeAlert(id), 5000);
    } catch (err) {
      setError(err);
      console.error('Erreur lors de l\'ajout d\'alerte:', err);
    }
  };

  const removeAlert = (id) => {
    try {
      setAlerts(prev => prev.filter(alert => alert.id !== id));
    } catch (err) {
      setError(err);
      console.error('Erreur lors de la suppression d\'alerte:', err);
    }
  };

  useEffect(() => {
    if (error) {
      console.error('Erreur dans AlertProvider:', error);
    }
  }, [error]);

  return (
    <AlertContext.Provider value={{ alerts, addAlert, removeAlert, error }}>
      {children}
    </AlertContext.Provider>
  );
};

const useAlert = () => {
  const context = React.useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert doit être utilisé dans un AlertProvider');
  }
  if (context.error) {
    console.error('Erreur dans le contexte d\'alerte:', context.error);
  }
  return context;
};

export { AlertProvider, useAlert };
