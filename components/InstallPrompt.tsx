import React, { useState, useEffect } from 'react';
import { Download, X, Monitor, CheckCircle2 } from 'lucide-react';
import { Logo } from './Logo';

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  // 1. Captura o evento nativo do Chrome/Android
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // NOTA: Pop-up automático removido conforme solicitado.
      // O evento é capturado apenas para permitir o gatilho manual via 'FeaturedCollections'.
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // 2. Escuta o clique do botão "Baixar Agora" (Vindo da Home/Coleções)
  useEffect(() => {
    const handleManualTrigger = async () => {
      if (deferredPrompt) {
        // Ação direta: Chama o prompt nativo do navegador
        deferredPrompt.prompt();
        
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setDeferredPrompt(null);
          setIsVisible(false);
        }
      } else {
        console.log('Instalação automática indisponível neste navegador.');
      }
    };

    window.addEventListener('moonflix-trigger-install', handleManualTrigger);
    return () => window.removeEventListener('moonflix-trigger-install', handleManualTrigger);
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsVisible(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('installPromptDismissed', 'true');
  };

  // Se não estiver visível (o que agora é o padrão, pois removemos o auto-show), não renderiza nada visual.
  if (!isVisible || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 md:bottom-6 md:right-6 md:left-auto z-[9999] flex justify-center md:justify-end p-4 pointer-events-none">
      <div className="pointer-events-auto max-w-sm w-full bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-700 relative group">
        
        {/* Efeito Glow Roxo no Topo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-brand shadow-[0_0_20px_rgba(166,99,204,1)] rounded-full opacity-80"></div>
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-brand/20 blur-[60px] rounded-full pointer-events-none"></div>

        <div className="p-5 relative z-10">
          
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-black/60 rounded-xl border border-white/10 flex items-center justify-center shadow-lg">
                  <Logo size="sm" />
               </div>
               <div>
                 <h3 className="text-white font-bold text-sm leading-tight">MoonFlix App</h3>
                 <p className="text-brand text-[10px] font-bold uppercase tracking-wider">Disponível para Instalar</p>
               </div>
            </div>
            <button 
              onClick={handleDismiss}
              className="text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full p-1.5 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Texto */}
          <div className="mb-5 space-y-2">
            <p className="text-gray-300 text-xs leading-relaxed">
              Instale o aplicativo oficial para melhor performance e acesso rápido.
            </p>
            <div className="flex items-center gap-3 mt-3">
               <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded text-[10px] text-gray-300 border border-white/5">
                  <Monitor size={10} className="text-brand" /> Rápido
               </div>
               <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded text-[10px] text-gray-300 border border-white/5">
                  <CheckCircle2 size={10} className="text-green-400" /> Seguro
               </div>
            </div>
          </div>

          {/* Botão Único (Nativo) */}
          <button 
            onClick={handleInstallClick}
            className="w-full bg-brand hover:bg-brand/90 text-white font-bold text-sm py-3 rounded-xl shadow-lg shadow-brand/20 flex items-center justify-center gap-2 transition-all active:scale-95 group/btn"
          >
            <Download size={18} className="group-hover/btn:-translate-y-0.5 transition-transform" />
            Instalar Agora
          </button>

        </div>
      </div>
    </div>
  );
};