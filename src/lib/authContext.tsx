import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, ADMIN_EMAIL } from './mockData';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function isAdminEmail(email: string): boolean {
  const lower = email.toLowerCase();
  return lower === ADMIN_EMAIL || lower.includes('.admin');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Listen for Supabase auth state (Google sign-in)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const meta = session.user.user_metadata;
          const name = meta?.full_name || meta?.name || session.user.email?.split('@')[0] || 'User';
          const email = session.user.email || '';
          setUser({ email, name, role: 'user' });
        }
      }
    );

    // Check existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user && !user) {
        const meta = session.user.user_metadata;
        const name = meta?.full_name || meta?.name || session.user.email?.split('@')[0] || 'User';
        const email = session.user.email || '';
        setUser({ email, name, role: 'user' });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = (email: string, _password: string, role: UserRole) => {
    const lower = email.toLowerCase();
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

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  };

  const logout = () => {
    supabase.auth.signOut().catch(() => {});
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
