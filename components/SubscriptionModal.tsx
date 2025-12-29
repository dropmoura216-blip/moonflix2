import React, { useState } from 'react';
import { X, Check, Star, Zap, Shield, Tv, MousePointerClick } from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '../contexts/AuthContext';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose }) => {
  const { subscribe } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSubscribe = () => {
    setIsProcessing(true);
    // Simula processamento de pagamento
    setTimeout(() => {
        subscribe();
        setIsProcessing(false);
        onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-[#0f1110] border border-brand/30 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        
        {/* Decorative Header */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-brand/20 to-transparent pointer-events-none" />
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors z-20"
        >
          <X size={20} />
        </button>

        <div className="p-8 relative z-10 flex flex-col items-center text-center">
          <div className="mb-6 scale-90">
            <Logo size="lg" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/20 border border-brand/30 text-brand text-xs font-bold uppercase tracking-wider mb-4">
            <Star size={12} fill="currentColor" /> Premium
          </div>

          <h2 className="text-3xl font-black text-white mb-2">Chega de Anúncios</h2>
          <p className="text-gray-400 text-sm max-w-xs mx-auto mb-8">
            Assista seus filmes e séries favoritos direto, sem interrupções e sem pop-ups.
          </p>

          {/* Pricing Card */}
          <div className="w-full bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6 mb-8 relative overflow-hidden group">
             <div className="absolute inset-0 bg-brand/5 opacity-0 group-hover:opacity-100 transition-opacity" />
             
             <div className="flex justify-between items-end mb-6 relative z-10">
                <div className="text-left">
                    <p className="text-gray-400 text-xs font-medium uppercase">Plano Mensal</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-sm text-gray-400 font-medium">R$</span>
                        <span className="text-4xl font-black text-white">6,90</span>
                        <span className="text-gray-500 text-sm">/mês</span>
                    </div>
                </div>
                <div className="bg-brand text-white text-[10px] font-bold px-2 py-1 rounded">OFERTA</div>
             </div>

             <ul className="space-y-3 relative z-10">
                <li className="flex items-center gap-3 text-sm text-white font-bold">
                    <MousePointerClick size={16} className="text-brand" /> 
                    <span>Zero Anúncios Pop-up (Clique e Toca)</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-300">
                    <Check size={16} className="text-brand" /> 
                    <span>Acesso a <strong>Todos</strong> os Filmes e Séries</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-300">
                    <Tv size={16} className="text-brand" /> 
                    <span>Qualidade <strong>4K Ultra HD</strong></span>
                </li>
             </ul>
          </div>

          <button 
            onClick={handleSubscribe}
            disabled={isProcessing}
            className="w-full py-4 bg-brand hover:bg-brand/90 text-white font-bold rounded-xl shadow-lg shadow-brand/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-wait relative overflow-hidden"
          >
            {isProcessing ? (
                <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processando...
                </div>
            ) : (
                "Assinar Agora por R$ 6,90"
            )}
          </button>
          
          <p className="text-[10px] text-gray-600 mt-4">
            Cancele a qualquer momento. Preço promocional por tempo limitado.
          </p>

        </div>
      </div>
    </div>
  );
};