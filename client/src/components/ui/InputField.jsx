import React, { useState } from "react";

const InputField = ({
                        icon: Icon,
                        altIcon: AltIcon,
                        label,
                        type,
                        id,
                        placeholder,
                        error,
                        isActive = true,
                    }) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    const toggleVisibility = () => {
        if (isPassword && AltIcon) {
            setShowPassword((prev) => !prev);
        }
    };

    const CurrentIcon = isPassword && showPassword && AltIcon ? AltIcon : Icon;

    return (
        <div className="relative">
            {label && (
                <label
                    htmlFor={id}
                    className="block text-sm font-workSans-bold text-[var(--deep-sea)] mb-1"
                >
                    {label}
                </label>
            )}

            <div className="relative group">
                {Icon && (
                    <button
                        type="button"
                        onClick={toggleVisibility}
                        className="transition-all duration-150 ease-in-out cursor-pointer absolute left-3 top-1/2 -translate-y-1/2 z-10 focus:outline-none"
                    >
                        <CurrentIcon className="transition-all duration-150 ease-in-outw-5 h-5 text-[var(--deep-sea)]" />
                    </button>
                )}

                <input
                    tabIndex={isActive ? 0 : -1}
                    type={inputType}
                    id={id}
                    name={id}
                    placeholder={placeholder}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${id}-error` : undefined}
                    className={`
            mt-1 block w-full pl-11 pr-4 py-3
            border border-[var(--sand)] rounded-xl shadow-sm
            focus:outline-none focus:ring-2 focus:ring-[var(--coastal-sea)] focus:border-[var(--coastal-sea)]
            bg-white transition-all duration-300
            ${error ? "border-red-500 focus:ring-red-500 focus:border-red-500" : ""}
          `}
                />

                {error && (
                    <p id={`${id}-error`} className="mt-1 text-sm text-red-500 absolute">
                        {error}
                    </p>
                )}
            </div>
        </div>
    );
};

export default InputField;
