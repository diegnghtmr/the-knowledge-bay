import { createContext, useContext, useEffect, useState } from 'react';
import { getSession, login as apiLogin, logout as apiLogout, register } from '../services/authApi.js';
import { clearSession, getSessionToken, saveSession, subscribeToSession } from './session.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => ({
    session: null,
    status: getSessionToken() ? 'checking' : 'ready',
  }));

  useEffect(() => {
    const unsubscribe = subscribeToSession((session) => setAuth({ session, status: 'ready' }));
    const token = getSessionToken();
    const controller = new AbortController();

    if (token) {
      getSession(controller.signal).then((response) => {
        if (controller.signal.aborted || getSessionToken() !== token) return;
        if (!response.success || !saveSession(token, response.data)) {
          setAuth({ session: null, status: 'unavailable' });
        }
      });
    }

    return () => {
      controller.abort();
      unsubscribe();
    };
  }, []);

  async function login(credentials) {
    const response = await apiLogin(credentials);
    if (!response.success) return response;

    const session = saveSession(response.data?.token, response.data);
    if (!session) return { success: false, message: 'No pudimos verificar tu sesión.' };

    return { success: true, role: session.userRole, data: { userId: session.userId, role: session.userRole } };
  }

  async function logout() {
    const token = getSessionToken();
    if (!token) return;
    const request = apiLogout();
    clearSession(token);
    await request;
  }

  const { session, status } = auth;
  const value = {
    status,
    token: session?.token ?? null,
    userId: session?.userId ?? null,
    userRole: session?.userRole ?? 'student',
    isAuthenticated: Boolean(session),
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Preserve the public hook path used by feature modules.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
