import React, { createContext, useState, useCallback, useContext } from 'react';

export const AlertContext = createContext({
  alerts: [],
  addAlert: () => {},
  removeAlert: () => {},
});

export function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState([]);

  const removeAlert = useCallback((id) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }, []);

  const addAlert = useCallback((message, type = 'info') => {
    const id = Date.now().toString();
    setAlerts((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      removeAlert(id);
    }, 5000);
  }, [removeAlert]);

  const value = {
    alerts,
    addAlert,
    removeAlert,
    showAlert: addAlert // Alias pour compatibilité
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
    </AlertContext.Provider>
  );
}

// Hook personnalisé pour utiliser le contexte d'alerte
export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert doit être utilisé à l\'intérieur d\'un AlertProvider');
  }
  return context;
};

export default AlertContext;
