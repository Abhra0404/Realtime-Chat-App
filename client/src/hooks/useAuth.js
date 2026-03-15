import { useEffect, useMemo, useState } from "react";
import { authApi, setAuthToken } from "../services/api";

const STORAGE_KEY = "pulsechat_auth";

export const useAuth = () => {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY) || "");
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(token));

  useEffect(() => {
    setAuthToken(token || "");
  }, [token]);

  useEffect(() => {
    const hydrate = async () => {
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await authApi.me();
        setUser(response.data.user);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
        setToken("");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    hydrate();
  }, [token]);

  const login = async (payload) => {
    const response = await authApi.login(payload);
    const nextToken = response.data.token;
    localStorage.setItem(STORAGE_KEY, nextToken);
    setToken(nextToken);
    setUser(response.data.user);
    return response.data;
  };

  const register = async (payload) => {
    const response = await authApi.register(payload);
    const nextToken = response.data.token;
    localStorage.setItem(STORAGE_KEY, nextToken);
    setToken(nextToken);
    setUser(response.data.user);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setToken("");
    setUser(null);
  };

  return useMemo(
    () => ({
      token,
      user,
      isLoading,
      login,
      register,
      logout
    }),
    [token, user, isLoading]
  );
};
