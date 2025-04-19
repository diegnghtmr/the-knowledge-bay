import { useState, useEffect } from "react";
import { useAuth } from '../context/AuthContext'; // Import useAuth
import {
  EnvelopeIcon,
  UserIcon,
  LockClosedIcon,
} from "@heroicons/react/24/solid";

// Assets
import logo from "../assets/img/logoAlt.webp";
import loginImg from "../assets/img/stayWithUs.webp";
import registrationImg from "../assets/img/joinNow.webp";

const IconWrapper = ({ Icon }) => (
  <Icon className="w-5 h-5 text-[var(--deep-sea)]" aria-hidden="true" />
);

const InputField = ({
  icon: Icon,
  label,
  type,
  id,
  placeholder,
  error,
  isActive = true,
}) => (
  <div className="relative">
    <label
      htmlFor={id}
      className="block text-sm font-workSans-bold text-[var(--deep-sea)] mb-1"
    >
      {label}
    </label>
    <div className="relative group">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 transition-transform duration-300 group-focus-within:scale-110">
        <IconWrapper Icon={Icon} />
      </div>
      <input
        tabIndex={isActive ? 0 : -1}
        type={type}
        id={id}
        name={id}
        className={`
          mt-1 block w-full pl-11 pr-4 py-3
          border border-[var(--sand)] rounded-xl shadow-sm
          focus:outline-none focus:ring-2 focus:ring-[var(--coastal-sea)] focus:border-[var(--coastal-sea)]
          bg-white transition-all duration-300
          ${error ? "border-red-500 focus:ring-red-500 focus:border-red-500" : ""}
        `}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-500 absolute">
          {error}
        </p>
      )}
    </div>
  </div>
);

const SubmitButton = ({ children, isLoading }) => (
  <button
    type="submit"
    disabled={isLoading}
    className="
      relative w-full flex justify-center py-3 px-6 z-30
      bg-[var(--coastal-sea)] hover:bg-[var(--sand)] text-white hover:text-[var(--deep-sea)]
      font-workSans-bold rounded-2xl shadow-lg
      transition-all duration-300 transform hover:scale-[1.02]
      disabled:opacity-70 disabled:cursor-not-allowed
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

const WallSwitch = ({ isLogin, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className="group relative w-16 h-8 rounded-full cursor-pointer shadow-inner overflow-hidden transition-all duration-500 ease-in-out hover:shadow-lg hover:scale-105 z-20 focus:outline-none"
    aria-label={isLogin ? "Cambiar a Registro" : "Cambiar a Inicio de Sesión"}
  >
    <div
      className={`absolute inset-0 transition-all duration-500 ease-in-out bg-gradient-to-r from-[var(--coastal-sea)] via-[var(--sand)] to-[var(--coastal-sea)] bg-[length:200%_100%] ${
        isLogin
          ? "[background-position:0%_0%]"
          : "[background-position:100%_0%]"
      }`}
    />
    <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-all duration-500 bg-white backdrop-blur" />
    <div
      className={`absolute top-1 w-6 h-6 rounded-full shadow-lg transition-all duration-500 ease-in-out bg-white backdrop-blur-sm group-hover:ring-2 ring-white/50 ${
        isLogin
          ? "left-1 transform rotate-0 scale-100"
          : "left-9 transform rotate-180 scale-100"
      } group-hover:scale-110 group-active:scale-95`}
    >
      <div className="w-full h-full flex items-center justify-center">
        <div
          className={`w-3 h-[2px] bg-[var(--coastal-sea)] rounded-full transform transition-all duration-500 ${
            isLogin ? "-rotate-45" : "rotate-135"
          }`}
        />
      </div>
    </div>
  </button>
);

const Auth = ({ initialView = "login", isVisible = false }) => {
  const [activeForm, setActiveForm] = useState(initialView);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(''); // Add error state
  const { login, register } = useAuth(); // Get login/register from context
  const isLogin = activeForm === "login";

  useEffect(() => {
    setActiveForm(initialView);
  }, [initialView]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    setIsLoading(true);

    const formData = new FormData(e.target);
    const credentials = Object.fromEntries(formData.entries());

    try {
      let response;
      if (isLogin) {
        console.log('Attempting login via Auth modal:', credentials);
        response = await login({ email: credentials.email, password: credentials.password });
      } else {
        // Basic validation for registration form
        if (credentials['register-password'] !== credentials['confirm-password']) {
          throw new Error("Passwords do not match.");
        }
        console.log('Attempting registration via Auth modal:', credentials);
        response = await register({
          name: credentials.username, // Assuming username maps to name
          email: credentials['register-email'],
          password: credentials['register-password']
        });
      }

      console.log('Auth modal response:', response);
      if (!response || !response.success) {
        setError(response?.message || (isLogin ? 'Login failed.' : 'Registration failed.'));
      }
      // TODO: On success, the AuthProvider should handle state change and App.jsx redirection
      // Optionally, you could add logic here to close the modal on success
    } catch (err) {
      console.error("Auth modal error:", err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <section
      className={`fixed inset-0 flex items-center justify-center transition-all duration-500 ease-in-out ${
        isVisible
          ? "bg-opacity-50 opacity-100 pointer-events-auto"
          : "bg-opacity-0 opacity-0 pointer-events-none"
      }`}
      aria-hidden={!isVisible}
    >
      <main
        className={`p-8 bg-white rounded-xl shadow-lg w-full max-w-5xl transform transition-all duration-300 ease-in-out ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        <section className="box-border relative overflow-hidden bg-white">
         {/* Error Display */}
          {error && (
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded shadow-md max-w-md text-center">
              {error}
            </div>
          )}

          {/* Paneles para Login */}
          <div className="box-border inset-0 grid grid-cols-2 min-h-[500px]">
            <aside
              className={`box-border h-full rounded-xl bg-(--sand) transition-all duration-500 ease-in-out ${isLogin ? "opacity-100 z-10" : "opacity-0 z-0"}`}
            >
              <header className="box-border w-full flex flex-col justify-center p-12 text-(--coastal-sea)">
                <p className="text-left">Nos alegra verte de nuevo,</p>
                <h2 className="text-3xl font-workSans-bold text-center">
                  ¡Continúa tu viaje con nosotros!
                </h2>
              </header>

              <img
                src={loginImg}
                alt="beach"
                className="max-h-[220px] m-auto mb-[2rem]"
              />

              <div className="flex gap-4 p-4 bg-(--deep-sea) rounded-b-lg">
                <img src={logo} alt="logo" className="h-[2rem] w-auto" />
                <p className="text-xs text-(--coastal-sea) text-left max-w-[200px] ">
                  Conectando mentes, esparciendo el conocimiento.
                </p>
              </div>
            </aside>

            <article
              className={`relative flex items-center justify-center py-8 px-6 transition-all duration-500 ease-in-out ${isLogin ? "opacity-100 z-20" : "opacity-0 z-0"}`}
            >
              <form
                onSubmit={handleSubmit}
                className="space-y-6 w-full max-w-lg"
                aria-label="Formulario de inicio de sesión"
              >
                <InputField
                  icon={EnvelopeIcon}
                  label="Correo electrónico"
                  type="email"
                  id="email"
                  name="email" // Add name attribute
                  placeholder="tu@email.com"
                  isActive={isLogin}
                />
                <InputField
                  icon={LockClosedIcon}
                  label="Contraseña"
                  type="password"
                  id="password"
                  name="password" // Add name attribute
                  placeholder="••••••••"
                  isActive={isLogin}
                />
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    tabIndex={isLogin ? 0 : -1}
                    className="text-sm text-[var(--coastal-sea)] hover:text-[var(--sand)] transition-colors duration-300"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <SubmitButton isLoading={isLoading}>Ingresar</SubmitButton>
              </form>
            </article>
          </div>

          {/* Paneles para Registro */}
          <div className="absolute inset-0 grid grid-cols-2 gap-4">
            <article
              className={`relative flex items-center justify-center py-8 px-6 transition-all duration-500 ease-in-out ${!isLogin ? "opacity-100 z-20" : "opacity-0 z-0"}`}
            >
              <form
                onSubmit={handleSubmit}
                className="space-y-6 w-full max-w-lg"
                aria-label="Formulario de registro"
              >
                <InputField
                  icon={UserIcon}
                  label="Nombre de usuario"
                  type="text"
                  id="username"
                  name="username" // Add name attribute
                  placeholder="usuario123"
                  isActive={!isLogin}
                />
                <InputField
                  icon={EnvelopeIcon}
                  label="Correo electrónico"
                  type="email"
                  id="register-email"
                  name="register-email" // Add name attribute
                  placeholder="tu@email.com"
                  isActive={!isLogin}
                />
                <InputField
                  icon={LockClosedIcon}
                  label="Contraseña"
                  type="password"
                  id="register-password"
                  name="register-password" // Add name attribute
                  placeholder="••••••••"
                  isActive={!isLogin}
                />
                <InputField
                  icon={LockClosedIcon}
                  label="Confirmar contraseña"
                  type="password"
                  id="confirm-password"
                  name="confirm-password" // Add name attribute
                  placeholder="••••••••"
                  isActive={!isLogin}
                />
                <SubmitButton isLoading={isLoading}>Crear Cuenta</SubmitButton>
              </form>
            </article>
            <aside
              className={` rounded-xl bg-(--sand) transition-all duration-500 ease-in-out ${!isLogin ? "opacity-100 z-10" : "opacity-0 z-0"}`}
            >
              <header className="w-full flex flex-col justify-center p-12 mb-[0.6rem] text-(--coastal-sea)">
                <h2 className="text-3xl font-workSans-bold text-left">
                  ¡Únete hoy mismo!
                </h2>
                <p className="text-center opacity-90 ">
                  Comienza tu aventura hoy. Únete a nuestra comunidad y explora
                  con nosotros.
                </p>
              </header>

              <img
                src={registrationImg}
                className="max-h-[220px] m-auto mb-[2rem]"
                alt="ilustración de usuarios creando conocimiento"
              ></img>

              <div className="flex gap-4 p-4 bg-(--deep-sea) rounded-b-lg">
                <img src={logo} alt="logo" className="h-[2rem] w-auto" />
                <p className="text-xs text-(--coastal-sea) text-left max-w-[200px] ">
                  Conectando mentes, esparciendo el conocimiento.
                </p>
              </div>
            </aside>
          </div>

          <nav className="absolute top-6 left-1/2 transform -translate-x-1/2 z-50">
            <div
              className={`transform transition-all duration-500 ease-in-out ${isVisible ? "translate-y-0 opacity-100 scale-100" : "-translate-y-4 opacity-0 scale-95"}`}
            >
              <WallSwitch
                isLogin={isLogin}
                onToggle={() => setActiveForm(isLogin ? "register" : "login")}
              />
            </div>
          </nav>
        </section>
      </main>
    </section>
  );
};

export default Auth;