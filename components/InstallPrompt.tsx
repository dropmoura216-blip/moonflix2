import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    // 1. Verifica se já está instalado (Modo Standalone/PWA)
    const checkPWA = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                           (window.navigator as any).standalone === true;
      setIsPWA(isStandalone);
    };

    checkPWA();
    window.addEventListener('resize', checkPWA);

    // 2. Captura o evento nativo de instalação (Chrome/Android/Edge)
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
    if (deferredPrompt) {
      // ANDROID / CHROME / PC: Dispara o prompt nativo do sistema imediatamente
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      // IOS / OUTROS: Tenta abrir o menu de compartilhamento nativo como "ação de sistema"
      // iOS não permite "download" programático, o share sheet é a única API direta.
      if (navigator.share) {
        navigator.share({
            title: 'Instalar MoonFlix',
            url: window.location.href
        }).catch(() => {}); // Ignora erro se usuário cancelar
      } else {
        // Fallback final silencioso ou um alerta de sistema simples
        alert("Adicione à Tela de Início pelo menu do seu navegador.");
      }
    }
  };

  // Se já estiver instalado como App, o botão some
  if (isPWA) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] animate-in zoom-in duration-500">
      <button 
        onClick={handleInstallClick}
        className="group relative w-16 h-16 bg-brand hover:bg-[#b57bdc] rounded-full shadow-[0_0_35px_rgba(166,99,204,0.6)] flex items-center justify-center text-white transition-all duration-300 hover:scale-110 active:scale-95 ring-2 ring-white/20"
        aria-label="Baixar Aplicativo"
        title="Instalar App"
      >
        {/* Efeito de Pulso Constante para chamar atenção */}
        <span className="absolute inset-0 rounded-full bg-brand opacity-40 animate-ping duration-[2000ms]"></span>
        
        {/* Ícone de Download */}
        <Download size={28} className="relative z-10 drop-shadow-md fill-white/10" strokeWidth={3} />
      </button>
    </div>
  );
};