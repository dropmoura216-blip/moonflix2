import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isPremium: boolean;
  signOut: () => Promise<void>;
  subscribe: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  isPremium: false,
  signOut: async () => {},
  subscribe: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initSession = async () => {
      try {
        // Verificar sessão atual com tratamento de erro
        const { data, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (mounted) {
          setSession(data.session);
          setUser(data.session?.user ?? null);
          checkPremiumStatus(data.session?.user?.id);
        }
      } catch (error) {
        console.warn('Auth initialization failed (offline or invalid key?):', error);
        // Mantém estado deslogado em caso de erro
        if (mounted) {
          setSession(null);
          setUser(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initSession();

    // Escutar mudanças na autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        checkPremiumStatus(session?.user?.id);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const checkPremiumStatus = (userId?: string) => {
    if (!userId) {
        setIsPremium(false);
        return;
    }
    // Simulação de persistência de plano via LocalStorage
    const localStatus = localStorage.getItem(`moonflix_premium_${userId}`);
    setIsPremium(localStatus === 'true');
  };

  const subscribe = () => {
    if (user) {
        localStorage.setItem(`moonflix_premium_${user.id}`, 'true');
        setIsPremium(true);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
    setUser(null);
    setSession(null);
    setIsPremium(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, isPremium, signOut, subscribe }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);