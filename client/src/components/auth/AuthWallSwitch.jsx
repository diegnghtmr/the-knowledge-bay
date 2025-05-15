const AuthWallSwitch = ({ isLogin, onToggle }) => (
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

export default AuthWallSwitch;