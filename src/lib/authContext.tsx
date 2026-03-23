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

function isNeuEmail(email: string): boolean {
  return email.toLowerCase().endsWith('@neu.edu.ph');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const handleOAuthUser = async (session: { user: { user_metadata: Record<string, string>; email?: string } }) => {
    const email = session.user.email || '';
    if (!isNeuEmail(email)) {
      await supabase.auth.signOut();
      // Store error for login page to pick up
      sessionStorage.setItem('auth_error', 'Only NEU institutional accounts (@neu.edu.ph) are allowed.');
      setUser(null);
      return;
    }
    const meta = session.user.user_metadata;
    const name = meta?.full_name || meta?.name || email.split('@')[0] || 'User';
    setUser({ email, name, role: 'user' });
  };

  useEffect(() => {
    // Set up listener BEFORE getSession
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          await handleOAuthUser(session);
        }
      }
    );

    // Check existing session on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user && !user) {
        await handleOAuthUser(session);
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
        queryParams: {
          hd: 'neu.edu.ph',
        },
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
