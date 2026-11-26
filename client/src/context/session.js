const listeners = new Set();

export function getSessionToken() {
  return sessionStorage.getItem('token');
}

export function subscribeToSession(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function saveSession(token, identity) {
  const userRole = typeof identity?.role === 'string' ? identity.role.toLowerCase() : null;
  const userId = identity?.userId;
  if (typeof token !== 'string' || !token || typeof userId !== 'string' || !userId ||
      (userRole !== 'student' && userRole !== 'moderator')) {
    return null;
  }

  const session = { token, userId, userRole };
  sessionStorage.setItem('token', token);
  sessionStorage.setItem('role', userRole);
  sessionStorage.setItem('userId', userId);
  for (const listener of listeners) listener(session);
  return session;
}

export function clearSession(expectedToken) {
  if (!expectedToken || getSessionToken() !== expectedToken) return;

  sessionStorage.removeItem('token');
  sessionStorage.removeItem('role');
  sessionStorage.removeItem('userId');
  for (const listener of listeners) listener(null);
}
