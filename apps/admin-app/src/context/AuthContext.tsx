"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { AuthApi } from "../api/auth.api";
import { getAuthToken } from "../api/client";
import { Compass } from "lucide-react";

export interface AuthUser {
  id: number;
  email: string;
  full_name: string;
  phone?: string | null;
  is_active: boolean;
  is_superuser: boolean;
  created_at?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === "/login";

  const refreshUser = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      if (!isLoginPage) {
        router.replace("/login");
      }
      return;
    }

    try {
      const userData = await AuthApi.getCurrentUser();
      setUser(userData);
      if (isLoginPage) {
        router.replace("/");
      }
    } catch {
      AuthApi.logout();
      setUser(null);
      if (!isLoginPage) {
        router.replace("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [isLoginPage, router]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, pass: string) => {
    await AuthApi.login(email, pass);
    const userData = await AuthApi.getCurrentUser();
    setUser(userData);
    router.replace("/");
  };

  const logout = () => {
    AuthApi.logout();
    setUser(null);
    router.replace("/login");
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center gap-4 bg-bg-app w-screen min-h-screen select-none">
        <div className="flex justify-center items-center shadow-blue-500/20 shadow-xl rounded-2xl w-12 h-12 text-white animate-pulse bg-[var(--color-accent-primary)]">
          <Compass size={28} />
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="font-semibold text-text-heading text-sm">
            Hospital Navigator
          </span>
          <span className="text-text-muted text-xs">
            Authenticating session...
          </span>
        </div>
      </div>
    );
  }

  if (!user && !isLoginPage) {
    return null;
  }

  if (user && isLoginPage) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
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
