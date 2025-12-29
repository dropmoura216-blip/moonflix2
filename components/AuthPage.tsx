import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { Logo } from './Logo';
import { Mail, Lock, Loader2, ArrowRight, AlertCircle } from 'lucide-react';

interface AuthPageProps {
  onSuccess: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        // Auto-login after signup usually handled by supabase, 
        // but sometimes requires email confirmation setting check
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000807] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-brand/20 blur-[150px] rounded-full animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-500">
        
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>

        <h2 className="text-2xl font-bold text-white text-center mb-2">
          {isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}
        </h2>
        <p className="text-gray-400 text-center text-sm mb-8">
          {isLogin 
            ? 'Acesse sua lista e continue de onde parou.' 
            : 'Junte-se ao MoonFlix e explore o infinito.'}
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">E-mail</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand transition-colors" size={20} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full bg-[#151515] border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-brand/50 transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Senha</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand transition-colors" size={20} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#151515] border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-brand/50 transition-all"
                required
                minLength={6}
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand hover:bg-brand/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-brand/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                {isLogin ? 'Entrar' : 'Cadastrar'}
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(null); }}
              className="text-brand font-bold ml-2 hover:underline focus:outline-none"
            >
              {isLogin ? 'Cadastre-se' : 'Faça login'}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};
