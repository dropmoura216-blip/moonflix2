import React, { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare } from 'lucide-react';

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isPWA, setIsPWA] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // 1. Verifica se já está instalado (Modo Standalone)
    const checkPWA = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                           (window.navigator as any).standalone === true;
      setIsPWA(isStandalone);
    };

    // 2. Detecta iOS
    const checkIOS = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    };

    checkPWA();
    checkIOS();
    
    window.addEventListener('resize', checkPWA);

    // 3. Captura evento nativo do Chrome/Android
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('resize', checkPWA);
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    // Cenário 1: Android/Chrome/PC (Suporte Nativo)
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowIOSInstructions(false);
      }
    } 
    // Cenário 2: iOS (Sem suporte nativo, requer ação manual)
    else if (isIOS) {
      setShowIOSInstructions(true);
    }
    // Cenário 3: Outros navegadores sem suporte
    else {
      alert("Para instalar, acesse as opções do navegador e selecione 'Adicionar à Tela de Início'.");
    }
  };

  // Se já for PWA, não mostra nada
  if (isPWA) return null;

  return (
    <>
      {/* Botão Flutuante */}
      <div className={`fixed bottom-6 right-6 z-[9999] transition-all duration-500 ${showIOSInstructions ? 'opacity-0 pointer-events-none' : 'opacity-100 animate-in zoom-in'}`}>
        <button 
          onClick={handleInstallClick}
          className="group relative w-16 h-16 bg-brand hover:bg-[#b57bdc] rounded-full shadow-[0_0_35px_rgba(166,99,204,0.6)] flex items-center justify-center text-white transition-all duration-300 hover:scale-110 active:scale-95 ring-2 ring-white/20"
          aria-label="Baixar App"
        >
          <span className="absolute inset-0 rounded-full bg-brand opacity-40 animate-ping duration-[2000ms]"></span>
          <Download size={28} className="relative z-10 drop-shadow-md fill-white/10" strokeWidth={3} />
        </button>
      </div>

      {/* Modal Específico para iOS (Só aparece se clicar e for iOS) */}
      {showIOSInstructions && (
        <div className="fixed inset-0 z-[10000] flex items-end justify-center sm:items-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#151515] border border-white/10 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative animate-in slide-in-from-bottom-10 duration-300">
            <button 
              onClick={() => setShowIOSInstructions(false)}
              className="absolute top-4 right-4 p-1 bg-white/5 rounded-full text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-brand/20 rounded-2xl flex items-center justify-center mb-4 border border-brand/30">
                 <Download size={32} className="text-brand" />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">Instalar MoonFlix</h3>
              <p className="text-sm text-gray-400 mb-6">
                O iOS requer instalação manual. Siga os 2 passos abaixo:
              </p>

              <div className="w-full space-y-3">
                <div className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/5">
                   <span className="flex-shrink-0 w-8 h-8 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center font-bold">1</span>
                   <div className="text-left text-sm text-gray-300">
                      Toque no botão <Share size={14} className="inline mx-1 text-blue-400" /> <strong>Compartilhar</strong>
                   </div>
                </div>
                <div className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/5">
                   <span className="flex-shrink-0 w-8 h-8 bg-white/10 text-white rounded-full flex items-center justify-center font-bold">2</span>
                   <div className="text-left text-sm text-gray-300">
                      Selecione <PlusSquare size={14} className="inline mx-1" /> <strong>Adicionar à Tela de Início</strong>
                   </div>
                </div>
              </div>
              
              {/* Seta animada apontando para baixo (geralmente onde fica o botão share no iPhone) */}
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-white animate-bounce">
                 <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-white"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};