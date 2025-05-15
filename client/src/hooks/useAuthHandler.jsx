// hooks/useAuthHandler.js
import { useState } from 'react';
import { useAuth } from '../context/AuthContext'; // o donde esté tu contexto

export const useAuthHandler = ({ onRegisterSuccess, onLoginSuccess }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { login, register } = useAuth();

    const handleLogin = async ({ email, password }) => {
        setIsLoading(true);
        setError('');

        try {
            const response = await login({ email, password });
            if (!response.success) {
                setError(response.message || 'Login failed.');
            } else {
                onLoginSuccess?.(response.data); // optional callback
            }
        } catch (err) {
            console.error(err);
            setError("Unexpected error during login.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async ({ username, email, password, confirmPassword }) => {
        setIsLoading(true);
        setError('');

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            setIsLoading(false);
            return;
        }

        try {
            const response = await register({ username, email, password });
            if (!response.success) {
                setError(response.message || 'Registration failed.');
            } else {
                onRegisterSuccess?.(response.data); // optional callback
            }
        } catch (err) {
            console.error(err);
            setError("Unexpected error during registration.");
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        error,
        handleLogin,
        handleRegister,
        setError, // in case you want to reset it externally
    };
};

