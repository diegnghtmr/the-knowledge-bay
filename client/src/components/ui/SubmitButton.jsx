const SubmitButton = ({ children, isLoading, index }) => (
  <button
    type="submit"
    disabled={isLoading}
    tabIndex={index}
    className="
      relative w-full flex justify-center py-3 px-6 z-30
      bg-[var(--coastal-sea)] hover:bg-[var(--sand)] text-white hover:text-[var(--deep-sea)]
      font-workSans-bold rounded-2xl shadow-lg
      transition-all duration-300 transform hover:scale-[1.02]
      disabled:opacity-70 disabled:cursor-not-allowed
      cursor-pointer
    "
  >
    {isLoading ? (
      <>
        <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
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
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        Procesando...
      </>
    ) : (
      children
    )}
  </button>
);

export default SubmitButton;
