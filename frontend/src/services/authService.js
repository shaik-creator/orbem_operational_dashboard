import { createContext, createElement, useContext, useEffect, useMemo, useState } from 'react';
import api, { AUTH_SESSION_INVALIDATED_EVENT } from './api';
import { normalizeRole } from '../constants/roles';

const AuthContext = createContext(null);

export function getStoredUser() {
  try {
    const user = JSON.parse(localStorage.getItem('orbem_user') || 'null');
    return user ? { ...user, role: normalizeRole(user.role) } : null;
  } catch {
    return null;
  }
}

export function getToken() {
  return localStorage.getItem('orbem_token');
}

function persistSession(payload) {
  if (!payload?.token || !payload?.user) {
    throw new Error('The server returned an invalid authentication response.');
  }

  const user = { ...payload.user, role: normalizeRole(payload.user.role) };
  localStorage.setItem('orbem_token', payload.token);
  localStorage.setItem('orbem_user', JSON.stringify(user));
  return user;
}

export function clearSession() {
  localStorage.removeItem('orbem_token');
  localStorage.removeItem('orbem_user');
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getToken);
  const [user, setUser] = useState(() => (getToken() ? getStoredUser() : null));
  const [loading, setLoading] = useState(() => Boolean(getToken()));

  useEffect(() => {
    let mounted = true;

    function endSession() {
      clearSession();
      if (!mounted) return;
      setToken(null);
      setUser(null);
      setLoading(false);
    }

    function syncSessionFromStorage(event) {
      if (event.key && !['orbem_token', 'orbem_user'].includes(event.key)) return;

      const nextToken = getToken();
      setToken(nextToken);
      setUser(nextToken ? getStoredUser() : null);
      setLoading(false);
    }

    window.addEventListener(AUTH_SESSION_INVALIDATED_EVENT, endSession);
    window.addEventListener('storage', syncSessionFromStorage);

    async function refreshUser() {
      if (!getToken()) {
        clearSession();
        setToken(null);
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/api/auth/me');
        if (mounted) {
          const nextUser = { ...response.data.user, role: normalizeRole(response.data.user?.role) };
          setToken(getToken());
          setUser(nextUser);
          localStorage.setItem('orbem_user', JSON.stringify(nextUser));
        }
      } catch {
        endSession();
      } finally {
        if (mounted) setLoading(false);
      }
    }

    refreshUser();

    return () => {
      mounted = false;
      window.removeEventListener(AUTH_SESSION_INVALIDATED_EVENT, endSession);
      window.removeEventListener('storage', syncSessionFromStorage);
    };
  }, []);

  async function login(credentials) {
    const response = await api.post('/api/auth/login', credentials);
    const nextUser = persistSession(response.data);
    setToken(response.data.token);
    setUser(nextUser);
    return nextUser;
  }

  async function register(payload) {
    const response = await api.post('/api/auth/register', payload);
    const nextUser = persistSession(response.data);
    setToken(response.data.token);
    setUser(nextUser);
    return nextUser;
  }

  function logout() {
    clearSession();
    setToken(null);
    setUser(null);
  }

  function updateUser(nextUser) {
    if (!nextUser) return;
    const normalizedUser = { ...nextUser, role: normalizeRole(nextUser.role) };
    setUser(normalizedUser);
    localStorage.setItem('orbem_user', JSON.stringify(normalizedUser));
  }

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      updateUser,
      logout,
      isAuthenticated: Boolean(user && token)
    }),
    [user, token, loading]
  );

  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
