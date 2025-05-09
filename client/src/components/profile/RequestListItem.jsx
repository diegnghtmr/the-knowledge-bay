import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const StyledCheckmark = ({ isCompleted, isAnimating, onClick, disabled }) => {
  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={`
        relative w-6 h-6
        flex items-center justify-center
        transform transition-all duration-300 ease-out
        ${isAnimating ? 'scale-110' : ''}
        ${disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-105 active:scale-95'}
      `}
      role="checkbox"
      aria-checked={isCompleted}
      tabIndex={disabled ? -1 : 0}
    >
      {/* Background circle with gradient */}
      <div
        className={`
          absolute inset-0 rounded-full
          bg-gradient-to-br from-[var(--coastal-sea)] to-[var(--deep-sea)]
          transform transition-all duration-300 ease-out
          ${isCompleted ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}
        `}
      />
      
      {/* Outer circle for hover effect */}
      <div
        className={`
          absolute inset-0 rounded-full
          border-2 border-[var(--open-sea)]
          transform transition-all duration-300 ease-out
          ${isCompleted ? 'opacity-0' : 'hover:border-[var(--coastal-sea)]'}
          ${!disabled && !isCompleted && 'hover:shadow-[0_0_12px_rgba(var(--coastal-sea-rgb),0.3)]'}
        `}
      >
        {/* Ripple effect on click */}
        <span className="absolute inset-0 rounded-full bg-[var(--coastal-sea)]/20 animate-ripple" />
      </div>

      {/* Checkmark SVG */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className={`
          relative w-4 h-4 z-10
          transition-all duration-300 ease-out
          ${isAnimating ? 'scale-150 opacity-0' : 'scale-100'}
          ${isCompleted ? 'opacity-100' : 'opacity-0'}
        `}
      >
        <path
          d="M5 13l4 4L19 7"
          className={`
            stroke-[var(--sand)]
            stroke-[2.5]
            fill-none
            stroke-linecap-round
            stroke-linejoin-round
            ${isCompleted ? 'animate-drawCheck' : ''}
          `}
        />
      </svg>

      {/* Error state shake animation */}
      {!isCompleted && disabled && (
        <div className="absolute inset-0 animate-shake">
          <div className="w-full h-full rounded-full border-2 border-red-500" />
        </div>
      )}
    </div>
  );
};

const RequestListItem = ({ request, onView }) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckmarkAnimating, setIsCheckmarkAnimating] = useState(false);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const handleCheckmarkClick = async () => {
    if (!isCompleted && !isCheckmarkAnimating) {
      setIsCheckmarkAnimating(true);
      if (!prefersReducedMotion) {
        await new Promise(resolve => setTimeout(resolve, 600)); // Extended animation time
      }
      setIsCompleted(true);
      setIsCheckmarkAnimating(false);
    }
  };

  const handleView = async () => {
    setIsLoading(true);
    try {
      await onView(request.id);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className={`
        flex items-center justify-between py-3 px-4
        border-b border-[var(--coastal-sea)] last:border-b-0
        transition-all duration-300 ease-in-out
        hover:bg-[var(--coastal-sea)]/5
        hover:shadow-md hover:-translate-y-[1px]
        active:translate-y-0 active:shadow-sm
        rounded-lg my-1
        ${isCompleted ? 'opacity-70 bg-[var(--sand)]/50' : ''}
      `}
    >
      <span 
        className={`
          text-[var(--deep-sea)] font-medium
          transition-all duration-300 ease-in-out
          ${isCompleted ? 'line-through opacity-70' : ''}
        `}
      >
        {request.name}
      </span>
      <div className="flex items-center space-x-3">
        <StyledCheckmark
          isCompleted={isCompleted}
          isAnimating={isCheckmarkAnimating}
          onClick={handleCheckmarkClick}
          disabled={isCompleted}
        />
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
          `}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-[var(--sand)]"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Cargando...
            </span>
          ) : (
            'Ver'
          )}
        </button>
      </div>
    </div>
  );
};

RequestListItem.propTypes = {
  request: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  onView: PropTypes.func.isRequired,
};

StyledCheckmark.propTypes = {
  isCompleted: PropTypes.bool.isRequired,
  isAnimating: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default RequestListItem;