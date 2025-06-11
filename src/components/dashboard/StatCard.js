import React from 'react';

const StatCard = ({ title, value, icon, color, textColor }) => {
  return (
    <div className={`rounded-lg p-6 bg-blue-100 transition-all hover:bg-black/80`}>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
          <h3 className={`${textColor} text-2xl font-bold`}>{value}</h3>
        </div>
        <div className="rounded-full p-3 bg-black/80 hover:bg-black/90">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;