import React from 'react';
import PropTypes from 'prop-types';

const ListItem = ({ firstName, lastName, name, onView }) => {
  // Use name if provided, otherwise combine firstName and lastName
  const displayText = name || `${firstName || ''} ${lastName || ''}`.trim();
  
  return (
    <div className="flex justify-between items-center p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
      <span className="text-gray-800">{displayText}</span>
      <button
        onClick={onView}
        className="px-3 py-1 text-sm text-white bg-[var(--coastal-sea)] rounded hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--coastal-sea)] focus:ring-opacity-50"
      >
        Ver
      </button>
    </div>
  );
};

ListItem.propTypes = {
  firstName: PropTypes.string,
  lastName: PropTypes.string,
  name: PropTypes.string,
  onView: PropTypes.func.isRequired
};

export default ListItem; 