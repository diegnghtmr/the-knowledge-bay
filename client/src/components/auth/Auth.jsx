import { useState, useEffect } from "react";
import AuthWallSwitch from './AuthWallSwitch.jsx';

// Assets
import loginImg from "../../assets/img/stayWithUs.webp";
import registrationImg from "../../assets/img/joinNow.webp";
import Wall from "./AuthWall.jsx";
import AuthForm from "./AuthForm.jsx";
import {useAuthHandler} from "../../hooks/useAuthHandler";
import {useNavigate} from "react-router-dom";


const Auth = ({ initialView = "login", isVisible = false, setData, onCoontinue }) => {
    const navigate = useNavigate();
    const [activeForm, setActiveForm] = useState(initialView);
    const isLogin = activeForm === "login";

    useEffect(() => {
        console.log('Auth initialView:', initialView);
        setActiveForm(initialView);
    }, [initialView]);


    const {
        handleLogin,
        isLoading,
        error,
        setError,

    } = useAuthHandler({
        onLoginSuccess: (user) => {
            console.log("Login success:", user);
        }
    });

    const handlerSubmit = (e) => {
        e.preventDefault();
        setError(''); // Clear previous errors
        const formData = new FormData(e.target); // Get form data
        const credentials = Object.fromEntries(formData.entries()); // Convert form data to object

       if (isLogin) {
           handleLogin({
               email: credentials.email, password:credentials.password
           });

       } else {
           navigate("/register/steps");
           const data = {
               username: credentials.username,
               email: credentials['register-email'],
               password: credentials['register-password'],
               showSignup: true
           };

               onCoontinue(1500);

           setData(data)
           }
       }

       return (
        <section
            className={`absolute top-[170%] inset-0 flex items-center justify-center transition-all duration-500 ease-in-out ${
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
                <section className="box-border relative overflow-hidden bg-white min-h-[600px] grid">

                    {error && (
                        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded shadow-md max-w-md text-center">
                            {error}
                        </div>
                    )}

                    {/* Login */}
                    <div className="box-border inset-0 grid grid-cols-2">

                        <Wall type="login" image={loginImg} state={isLogin}/>
                        <article className={`
                        relative
                        flex items-center justify-center
                        py-8 px-6
                        transition-all duration-500 ease-in-out
                        ${isLogin ? "opacity-100 z-20" : "opacity-0 z-0"}`}
                        >
                            <AuthForm
                                type={"login"}
                                action={handlerSubmit}
                                state={isLogin}
                                loadState={isLoading}
                            />

                        </article>
                    </div>

                    {/* Register */}
                    <div className="absolute inset-0 grid grid-cols-2 gap-4">
                        <article className={`
                        relative
                        flex items-center justify-center
                        py-8 px-6
                        transition-all duration-500 ease-in-out
                        ${!isLogin ? "opacity-100 z-20" : "opacity-0 z-0"}`}
                        >
                            <AuthForm
                                type={"register"}
                                action={handlerSubmit}
                                state={!isLogin}
                                loadState={isLoading}
                            />
                        </article>
                        <Wall type="register" image={registrationImg} state={isLogin}/>
                    </div>

                    <nav className="absolute top-6 left-1/2 transform -translate-x-1/2 z-50">
                        <div className={`
                        transform 
                        transition-all duration-500 ease-in-out 
                        ${isVisible ? "translate-y-0 opacity-100 scale-100" : "-translate-y-4 opacity-0 scale-95"}`}
                        >
                            <AuthWallSwitch
                                isLogin={isLogin}
                                onToggle={() => {
                                    initialView = isLogin ? "register" : "login";
                                    navigate("/"+initialView);
                                    setActiveForm(isLogin ? "register" : "login")}
                            }
                            />
                        </div>
                    </nav>

                </section>
            </main>
        </section>
    );
};

// const signUp = () => {
//     setData ({
//         username: credentials.username,
//         email: credentials['register-email'],
//         password: credentials['register-password'],
//         showSignup: true,
//         registerMethod: handleSubmit
//     });

export default Auth;