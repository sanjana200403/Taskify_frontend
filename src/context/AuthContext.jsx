import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authService } from "../services/authService.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const restoreSession = useCallback(async () => {
    try {
      setUser(await authService.me());
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
    const expire = () => setUser(null);
    window.addEventListener("todo:session-expired", expire);
    return () => window.removeEventListener("todo:session-expired", expire);
  }, [restoreSession]);

  const login = async (credentials) => {
    const nextUser = await authService.login(credentials);
    setUser(nextUser);
    return nextUser;
  };

  const register = async (details) => {
    const nextUser = await authService.register(details);
    setUser(nextUser);
    return nextUser;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  };

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
