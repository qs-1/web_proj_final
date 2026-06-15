import { createContext, useContext, useEffect, useState } from "react";
import { api, tokenStore } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, if we have a token, fetch the current user.
  useEffect(() => {
    let active = true;
    async function bootstrap() {
      if (!tokenStore.access && !tokenStore.refresh) {
        setLoading(false);
        return;
      }
      try {
        const me = await api.get("/api/auth/me/");
        if (active) setUser(me);
      } catch {
        tokenStore.clear();
      } finally {
        if (active) setLoading(false);
      }
    }
    bootstrap();
    return () => {
      active = false;
    };
  }, []);

  async function login(username, password) {
    const tokens = await api.post(
      "/api/auth/login/",
      { username, password },
      { auth: false }
    );
    tokenStore.set(tokens);
    const me = await api.get("/api/auth/me/");
    setUser(me);
    return me;
  }

  async function register(username, email, password) {
    await api.post(
      "/api/auth/register/",
      { username, email, password },
      { auth: false }
    );
    return login(username, password);
  }

  function logout() {
    tokenStore.clear();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, isAuthed: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
