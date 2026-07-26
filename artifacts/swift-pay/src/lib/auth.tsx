import { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  country: string;
  countryCode: string;
  verified: boolean;
  joinedAt: string;
  avatar?: string;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (fields: Partial<Pick<User, 'fullName' | 'email' | 'phone' | 'avatar'>>) => void;
}

export interface RegisterData {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  countryCode: string;
  password: string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Mock user store using localStorage
const STORAGE_KEY = 'swiftpay_user';
const USERS_KEY = 'swiftpay_users';

function getUsers(): Record<string, { user: User; password: string }> {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
  } catch {
    return {};
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const login = async (identifier: string, password: string) => {
    await new Promise((r) => setTimeout(r, 800)); // simulate network
    const users = getUsers();
    const entry = Object.values(users).find(
      (u) =>
        (u.user.email.toLowerCase() === identifier.toLowerCase() ||
          u.user.phone === identifier) &&
        u.password === password,
    );
    if (!entry) throw new Error('Identifiants incorrects');
    setUser(entry.user);
  };

  const register = async (data: RegisterData) => {
    await new Promise((r) => setTimeout(r, 1000));
    const users = getUsers();
    const exists = Object.values(users).some(
      (u) =>
        u.user.email.toLowerCase() === data.email.toLowerCase() ||
        u.user.phone === data.phone,
    );
    if (exists) throw new Error('Un compte existe déjà avec cet email ou ce numéro');

    const newUser: User = {
      id: `usr_${Date.now()}`,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      country: data.country,
      countryCode: data.countryCode,
      verified: false,
      joinedAt: new Date().toISOString(),
    };

    users[newUser.id] = { user: newUser, password: data.password };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
  };

  const updateUser = (fields: Partial<Pick<User, 'fullName' | 'email' | 'phone' | 'avatar'>>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...fields };
      // Sync to users store
      const users = getUsers();
      if (users[prev.id]) {
        users[prev.id].user = updated;
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
      }
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
