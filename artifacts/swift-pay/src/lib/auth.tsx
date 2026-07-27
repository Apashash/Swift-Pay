import { createContext, useContext, useEffect, useState } from "react";

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  country: string;
  countryCode: string;
  verified: boolean;
  role: "user" | "admin";
  joinedAt: string;
  avatar?: string | null;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (
    fields: Partial<Pick<User, "fullName" | "email" | "phone" | "avatar" | "verified">>,
  ) => void;
}

export interface RegisterData {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  countryCode: string;
  password: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

const SESSION_KEY = "swiftpay_session_token";
const LEGACY_USER_KEY = "swiftpay_user";
const LEGACY_USERS_KEY = "swiftpay_users";
const API_BASE = `${import.meta.env.BASE_URL.replace(/\/$/, "")}/api`;

const AuthContext = createContext<AuthContextValue | null>(null);

async function readError(response: Response): Promise<Error> {
  const body = (await response.json().catch(() => null)) as
    | { message?: string }
    | null;
  return new Error(body?.message || "Une erreur est survenue.");
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Remove the old browser-only account store. Accounts now exist only in Supabase.
    localStorage.removeItem(LEGACY_USER_KEY);
    localStorage.removeItem(LEGACY_USERS_KEY);

    const token = localStorage.getItem(SESSION_KEY);
    if (!token) {
      setIsLoading(false);
      return;
    }

    fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        if (!response.ok) {
          localStorage.removeItem(SESSION_KEY);
          throw await readError(response);
        }
        return response.json() as Promise<{ user: User }>;
      })
      .then(({ user: currentUser }) => setUser(currentUser))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (identifier: string, password: string) => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });
    if (!response.ok) throw await readError(response);
    const data = (await response.json()) as AuthResponse;
    localStorage.setItem(SESSION_KEY, data.token);
    setUser(data.user);
  };

  const register = async (data: RegisterData) => {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw await readError(response);
    const result = (await response.json()) as AuthResponse;
    localStorage.setItem(SESSION_KEY, result.token);
    setUser(result.user);
  };

  const logout = () => {
    const token = localStorage.getItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
    if (token) {
      void fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  };

  const updateUser = (
    fields: Partial<Pick<User, "fullName" | "email" | "phone" | "avatar" | "verified">>,
  ) => {
    const token = localStorage.getItem(SESSION_KEY);
    if (!token) return;
    void fetch(`${API_BASE}/auth/me`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(fields),
    }).then(async (response) => {
      if (!response.ok) throw await readError(response);
      const result = (await response.json()) as { user: User };
      setUser(result.user);
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isAdmin: user?.role === "admin",
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}