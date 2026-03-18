import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole, ADMIN_EMAIL } from './mockData';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function isAdminEmail(email: string): boolean {
  const lower = email.toLowerCase();
  return lower === ADMIN_EMAIL || lower.includes('.admin');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, _password: string, role: UserRole) => {
    const lower = email.toLowerCase();
    // Admin role requires ".admin" keyword in email or the main admin email
    if (role === 'admin' && !isAdminEmail(lower)) {
      return false;
    }
    setUser({
      email,
      name: lower === ADMIN_EMAIL ? 'JC Esperanza' : email.split('@')[0].replace('.admin', ''),
      role,
    });
    return true;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
