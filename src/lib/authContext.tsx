import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole, ADMIN_EMAIL } from './mockData';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, _password: string, role: UserRole) => {
    // Only jcesperanza@neu.edu.ph can log in as admin
    if (role === 'admin' && email.toLowerCase() !== ADMIN_EMAIL) {
      return false;
    }
    setUser({
      email,
      name: email.toLowerCase() === ADMIN_EMAIL ? 'JC Esperanza' : email.split('@')[0],
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
