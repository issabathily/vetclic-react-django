import React, { useContext } from 'react';
import { AlertContext, AlertType } from '../../contexts/AlertContext';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const getAlertStyles = (type: AlertType) => {
  switch (type) {
    case 'success':
      return {
        container: 'bg-green-50 border-green-400 text-green-800',
        icon: <CheckCircle className="h-5 w-5 text-green-400" />,
      };
    case 'error':
      return {
        container: 'bg-red-50 border-red-400 text-red-800',
        icon: <AlertCircle className="h-5 w-5 text-red-400" />,
      };
    case 'warning':
      return {
        container: 'bg-yellow-50 border-yellow-400 text-yellow-800',
        icon: <AlertTriangle className="h-5 w-5 text-yellow-400" />,
      };
    case 'info':
      return {
        container: 'bg-blue-50 border-blue-400 text-blue-800',
        icon: <Info className="h-5 w-5 text-blue-400" />,
      };
    default:
      return {
        container: 'bg-gray-50 border-gray-400 text-gray-800',
        icon: <Info className="h-5 w-5 text-gray-400" />,
      };
  }
};

const AlertContainer = () => {
  const { alerts, removeAlert } = useContext(AlertContext);

  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {alerts.map((alert) => {
        const styles = getAlertStyles(alert.type);
        
        return (
          <div
            key={alert.id}
            className={`${styles.container} border-l-4 p-4 rounded shadow-md flex items-start animate-fade-in`}
            role="alert"
          >
            <div className="flex-shrink-0 mr-3">
              {styles.icon}
            </div>
            <div className="flex-1">
              <p className="text-sm">{alert.message}</p>
            </div>
            <button
              onClick={() => removeAlert(alert.id)}
              className="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex h-8 w-8 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-50 focus:ring-green-600"
            >
              <span className="sr-only">Dismiss</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default AlertContainer;