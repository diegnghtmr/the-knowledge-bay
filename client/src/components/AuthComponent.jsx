import { useState, useEffect } from 'react';

const EmailIcon = () => (
  <svg className="w-5 h-5 text-[var(--deep-sea)]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const UserIcon = () => (
  <svg className="w-5 h-5 text-[var(--deep-sea)]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LockIcon = () => (
  <svg className="w-5 h-5 text-[var(--deep-sea)]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const InputField = ({ icon, label, type, id, placeholder, error }) => (
  <div className="relative">
    <label htmlFor={id} className="block text-sm font-workSans-bold text-[var(--deep-sea)] mb-1">
      {label}
    </label>
    <div className="relative group">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 transition-transform duration-300 group-focus-within:scale-110">
        {icon}
      </div>
      <input
        type={type}
        id={id}
        className={`
          mt-1 block w-full pl-11 pr-4 py-3
          border border-[var(--sand)] rounded-xl shadow-sm
          focus:outline-none focus:ring-2 focus:ring-[var(--coastal-sea)] focus:border-[var(--coastal-sea)]
          bg-white transition-all duration-300
          ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
        `}
        placeholder={placeholder}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500 absolute">
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
    className={`
      relative w-full flex justify-center py-3 px-6
      bg-(--coastal-sea) hover:bg-(--sand) text-white hover:text-[var(--deep-sea)]
      font-workSans-bold rounded-2xl shadow-lg 
      transition-all duration-300 transform hover:scale-[1.02]
      disabled:opacity-70 disabled:cursor-not-allowed
      overflow-hidden
    `}
  >
    {isLoading ? (
      <>
        <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
        </svg>
        Procesando...
      </>
    ) : children}
  </button>
);

const WallSwitch = ({ isLogin, onToggle }) => {
  return (
    <div 
      className="group relative w-16 h-8 rounded-full cursor-pointer shadow-inner overflow-hidden
                 transition-all duration-300 ease-in-out hover:shadow-lg
                 hover:scale-105"
      onClick={onToggle}
    >
      <div className={`
        absolute inset-0 transition-all duration-500 ease-in-out
        bg-gradient-to-r from-[var(--coastal-sea)] via-[var(--sand)] to-[var(--coastal-sea)]
        bg-[length:200%_100%]
        ${isLogin ? '[background-position:0%_0%]' : '[background-position:100%_0%]'}
      `}/>

      <div className={`
        absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300
        bg-white
      `}/>

      <div className={`
        absolute top-1 w-6 h-6 rounded-full shadow-lg transition-all duration-500 ease-in-out
        bg-white backdrop-blur-sm
        group-hover:ring-2 ring-white/50
        ${isLogin
          ? 'left-1 transform rotate-0 scale-100'
          : 'left-9 transform rotate-180 scale-100'
        }
        group-hover:scale-110
        group-active:scale-95
      `}>
        <div className="w-full h-full flex items-center justify-center">
          <div className={`
            w-3 h-[2px] bg-[var(--coastal-sea)] rounded-full 
            transform transition-transform duration-500
            ${isLogin ? '-rotate-45' : 'rotate-135'}
          `}/>
        </div>
      </div>
      <span className="sr-only">{isLogin ? 'Cambiar a Registro' : 'Cambiar a Inicio de Sesión'}</span>
    </div>
  );
};

const InfoPanel = ({ isLogin }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-12">
      <div className="w-full max-w-md space-y-8 text-white relative z-10">
        <h2 className="text-3xl font-workSans-bold text-center">
          {isLogin ? '¡Bienvenido de nuevo!' : '¡Únete hoy mismo!'}
        </h2>
        <p className="text-xl text-white text-center opacity-90">
          {isLogin
            ? "Nos alegra verte de nuevo. Continúa tu viaje con nosotros."
            : "Comienza tu aventura hoy. Únete a nuestra comunidad y explora con nosotros."}
        </p>
        <div className="relative mx-auto w-32 h-32">
          <div className="absolute inset-0 rounded-full bg-white/20"/>
          <div className="absolute inset-0 rounded-full bg-gradient-radial from-white/30 to-transparent"/>
        </div>
      </div>
    </div>
  );
};

const AuthComponent = ({ initialView = 'login', isVisible = false }) => {
  const [activeForm, setActiveForm] = useState(initialView);
  const [isLoading, setIsLoading] = useState(false);
  const isLogin = activeForm === 'login';

  useEffect(() => {
    setActiveForm(initialView);
  }, [initialView]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
  };

  const containerClasses = `
    fixed inset-0 flex items-center justify-center bg-black bg-opacity-50
    transition-opacity duration-300 ease-in-out
    ${isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
  `;

  const mainContainerClasses = `
    bg-linear-to-t from-10% from-(--sand) to-white rounded-xl
    shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] w-full max-w-5xl relative
    ${isVisible ? 'translate-y-0' : 'translate-y-full'}
  `;

  const LoginForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6 w-full p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-workSans-bold text-[var(--deep-sea)]">
          Iniciar Sesión
        </h2>
      </div>
      <InputField
        icon={<EmailIcon />}
        label="Correo electrónico"
        type="email"
        id="email"
        placeholder="tu@email.com"
      />
      <InputField
        icon={<LockIcon />}
        label="Contraseña"
        type="password"
        id="password"
        placeholder="••••••••"
      />
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          className="text-sm text-[var(--coastal-sea)] hover:text-[var(--sand)] transition-colors duration-300"
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>
      <SubmitButton isLoading={isLoading}>
        Ingresar
      </SubmitButton>
    </form>
  );

  const RegisterForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6 w-full p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-workSans-bold text-[var(--deep-sea)]">
          Crear Cuenta
        </h2>
      </div>
      <InputField
        icon={<UserIcon />}
        label="Nombre de usuario"
        type="text"
        id="username"
        placeholder="usuario123"
      />
      <InputField
        icon={<EmailIcon />}
        label="Correo electrónico"
        type="email"
        id="register-email"
        placeholder="tu@email.com"
      />
      <InputField
        icon={<LockIcon />}
        label="Contraseña"
        type="password"
        id="register-password"
        placeholder="••••••••"
      />
      <InputField
        icon={<LockIcon />}
        label="Confirmar contraseña"
        type="password"
        id="confirm-password"
        placeholder="••••••••"
      />
      <div className="pt-2">
        <SubmitButton isLoading={isLoading}>
          Crear Cuenta
        </SubmitButton>
      </div>
    </form>
  );

  return (
    <div className={containerClasses}>
      <div className={mainContainerClasses}>
        <div className="relative min-h-[650px] overflow-y-auto">
          <div className={`
            absolute top-0 w-1/2 h-full
            bg-linear-to-t from-10% from-(--open-sea) to-(--coastal-sea)
            ${isLogin ? 'left-0' : 'left-1/2'}
          `}>
            <div className="absolute inset-0 bg-black/5"/>
            <div className="relative w-full h-full">
              <InfoPanel isLogin={isLogin} />
            </div>
          </div>

          <div className={`
            absolute top-0 w-1/2 h-full flex items-center justify-center py-8 px-6
            ${isLogin ? 'right-0' : 'left-0'}
          `}>
            <div className="w-full max-w-lg">
              {isLogin ? <LoginForm /> : <RegisterForm />}
            </div>
          </div>

          <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10">
            <WallSwitch isLogin={isLogin} onToggle={() => setActiveForm(isLogin ? 'register' : 'login')} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthComponent;