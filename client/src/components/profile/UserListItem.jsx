import React, { useState } from 'react';
import PropTypes from 'prop-types';

const UserListItem = ({ user, onView }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleView = async () => {
    setIsLoading(true);
    try {
      await onView(user.id);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`
        flex items-center justify-between py-3 px-4
        border-b border-[var(--coastal-sea)] last:border-b-0
        transition-all duration-200 ease-in-out
        hover:bg-[var(--coastal-sea)]/5
        hover:shadow-md hover:-translate-y-[1px]
        active:translate-y-0 active:shadow-sm
        rounded-lg my-1
      `}
    >
      <span className="text-[var(--deep-sea)] font-medium transition-colors">
        {user.name}
      </span>
      <button
        onClick={handleView}
        disabled={isLoading}
        className={`
          px-4 py-2 text-sm text-[var(--sand)] rounded-md
          transition-all duration-200 ease-in-out
          transform active:scale-95
          focus:outline-none focus:ring-2 focus:ring-[var(--coastal-sea)] focus:ring-opacity-50
          disabled:opacity-50 disabled:cursor-not-allowed
          ${isLoading ? 'bg-[var(--coastal-sea)]' : 'bg-[var(--open-sea)] hover:bg-[var(--coastal-sea)]'}
          relative overflow-hidden
        `}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[var(--sand)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Cargando...
          </span>
        ) : (
          'Ver'
        )}
      </button>
    </div>
  );
};

UserListItem.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  onView: PropTypes.func.isRequired,
};

export default UserListItem;