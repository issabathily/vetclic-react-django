import React, { useContext } from 'react';
import { AlertContext } from '../contexts/AlertContext';

const Alert = () => {
  const context = useContext(AlertContext);
  const { alerts } = context;

  return (
    <div className="fixed top-4 right-4 z-50">
      {alerts.map((alert, index) => (
        <div
          key={index}
          className={`flex items-center p-4 mb-4 rounded-lg shadow ${
            alert.type === 'success' 
              ? 'bg-green-50 text-green-700' 
              : 'bg-red-50 text-red-700'
          }`}
        >
          <div className="ml-3 text-sm font-medium">
            {alert.message}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Alert;
