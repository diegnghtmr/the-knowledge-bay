import React from 'react';

const UserStatsCard = ({ title, value, icon, color }) => {
  return (
    <div className={`${color} rounded-lg p-4 text-white shadow-md transition-transform hover:scale-105`}>
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-2xl font-bold mt-1">{value.toLocaleString()}</p>
        </div>
        <span className="text-3xl opacity-80">{icon}</span>
      </div>
    </div>
  );
};

export default UserStatsCard; 