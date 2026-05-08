import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authClient } from '../api/auth-client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSession = useCallback(async () => {
    try {
      const res = await authClient.getSession();
      if (res.data?.user) {
        setUser(res.data.user);
        const profileRes = await fetch('/api/users/me', { credentials: 'include' });
        const profileData = await profileRes.json();
        if (profileData.success) {
          setProfile(profileData.data.profile);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
    } catch {
      setUser(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const login = async (email, password) => {
    const res = await authClient.signIn.email({ email, password });
    if (res.data) {
      await fetchSession();
    }
    return res;
  };

  const logout = async () => {
    await authClient.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, isLoading, login, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
