import { useState, useEffect } from "react";
import { useAuth } from '../../context/AuthContext'; // Import useAuth
import AuthWallSwitch from './AuthWallSwitch.jsx';

// Assets
import loginImg from "../../assets/img/stayWithUs.webp";
import registrationImg from "../../assets/img/joinNow.webp";
import Wall from "./AuthWall.jsx";
import AuthForm from "./AuthForm.jsx";
import {useNavigate} from "react-router-dom";


const Auth = ({ initialView = "login", isVisible = false }) => {
    const navigate = useNavigate();
    const [activeForm, setActiveForm] = useState(initialView);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(''); // Add error state
    const { login, register } = useAuth(); // Get login/register from context
    const isLogin = activeForm === "login";

    useEffect(() => {
        console.log('Auth initialView:', initialView);
        setActiveForm(initialView);
    }, [initialView]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Clear previous errors
        setIsLoading(true);

        const formData = new FormData(e.target);
        const credentials = Object.fromEntries(formData.entries());

        let response;
        try {
            if (isLogin) {
                console.log('Attempting login via Auth modal:', { email: credentials.email, password: '***' }); // Avoid logging password
                response = await login({ email: credentials.email, password: credentials.password });
            } else {
                if (credentials['register-password'] !== credentials['confirm-password']) {
                    setError("Passwords do not match.");
                    setIsLoading(false); // Stop loading if passwords don't match
                    return;
                }
                console.log('Attempting registration via Auth modal:', { username: credentials.username, email: credentials['register-email'], password: '***' }); // Avoid logging password
                response = await register({
                    username: credentials.username,
                    email: credentials['register-email'],
                    password: credentials['register-password']
                });
            }

            console.log('Auth modal response:', response);

            if (!response.success) {
                setError(response.message || (isLogin ? 'Login failed. Please check your credentials.' : 'Registration failed. Please try again.'));
            } else {
                setError(''); // Explicitly clear error on success
            }
        } catch (err) {
            console.error("Unexpected error during auth:", err);
            setError('An unexpected error occurred. Please try again later.');
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
                <section className="box-border relative overflow-hidden bg-white min-h-[600px] grid">

                    {error && (
                        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded shadow-md max-w-md text-center">
                            {error}
                        </div>
                    )}

                    {/* Login */}
                    <div className="box-border inset-0 grid grid-cols-2" id={"login"}>

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
                                action={handleSubmit}
                                state={isLogin}
                                loadState={isLoading}
                            />

                        </article>
                    </div>

                    {/* Register */}
                    <div className="absolute inset-0 grid grid-cols-2 gap-4" id={"register"}>
                        <article className={`
                        relative
                        flex items-center justify-center
                        py-8 px-6
                        transition-all duration-500 ease-in-out
                        ${!isLogin ? "opacity-100 z-20" : "opacity-0 z-0"}`}
                        >
                            <AuthForm
                                type={"register"}
                                action={handleSubmit}
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

export default Auth;