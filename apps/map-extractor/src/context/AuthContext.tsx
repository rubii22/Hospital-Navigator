import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { UserResponse } from "../api/types";
import { authApi } from "../api/auth.api";
import storage from "../utils/storage";

interface AuthContextType {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    fullName: string,
    phone?: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const loadStoredToken = async () => {
    try {
      const token = await storage.getItem("access_token");
      if (token) {
        const profile = await authApi.getMe(token);
        setUser(profile);
      }
    } catch (err) {
      try {
        const refToken = await storage.getItem("refresh_token");
        if (refToken) {
          const tokens = await authApi.refresh({ refresh_token: refToken });
          await storage.setItem("access_token", tokens.access_token);
          if (tokens.refresh_token) {
            await storage.setItem("refresh_token", tokens.refresh_token);
          }
          const profile = await authApi.getMe(tokens.access_token);
          setUser(profile);
        }
      } catch {
        await storage.removeItem("access_token");
        await storage.removeItem("refresh_token");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStoredToken();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const tokens = await authApi.login({ email, password });
      await storage.setItem("access_token", tokens.access_token);
      if (tokens.refresh_token) {
        await storage.setItem("refresh_token", tokens.refresh_token);
      }
      const profile = await authApi.getMe(tokens.access_token);
      setUser(profile);
    } catch (err: any) {
      const message = err?.message || "Login failed. Please check credentials.";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    fullName: string,
    phone?: string,
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      await authApi.register({ email, password, full_name: fullName, phone });
      await login(email, password);
    } catch (err: any) {
      const message = err?.message || "Registration failed. Try again.";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
    } catch {
      // Fail silently on network errors
    } finally {
      await storage.removeItem("access_token");
      await storage.removeItem("refresh_token");
      setUser(null);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
