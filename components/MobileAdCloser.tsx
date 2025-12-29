import React, { useEffect, useState } from 'react';
import { ShieldX, X } from 'lucide-react';

export const MobileAdCloser: React.FC = () => {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Função para verificar se existem elementos intrusivos (fora do root)
    const checkForAds = () => {
      // Verifica se é mobile
      if (window.innerWidth >= 768) {
        setShowButton(false);
        return;
      }

      const bodyChildren = document.body.children;
      let hasAds = false;

      for (let i = 0; i < bodyChildren.length; i++) {
        const el = bodyChildren[i] as HTMLElement;
        
        // Ignora elementos essenciais do React e do navegador
        if (
          el.id !== 'root' &&
          el.tagName !== 'SCRIPT' &&
          el.tagName !== 'STYLE' &&
          !el.hasAttribute('data-react-portal') && // Protege portais do React
          el.style.display !== 'none' && // Se já ocultamos, não conta como ativo
          el.style.visibility !== 'hidden'
        ) {
          hasAds = true;
          break; // Achou um anúncio, não precisa continuar
        }
      }

      setShowButton(hasAds);
    };

    // Observer para detectar quando scripts injetam novos elementos no body
    const observer = new MutationObserver((mutations) => {
      let shouldCheck = false;
      for (const mutation of mutations) {
        // Monitora apenas adição/remoção de nós diretos no body
        if (mutation.type === 'childList') {
          shouldCheck = true;
          break;
        }
      }
      if (shouldCheck) checkForAds();
    });

    observer.observe(document.body, { childList: true });

    // Verificação inicial
    checkForAds();
    window.addEventListener('resize', checkForAds);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', checkForAds);
    };
  }, []);

  const clearOverlays = () => {
    const bodyChildren = document.body.children;
    
    Array.from(bodyChildren).forEach(child => {
      const el = child as HTMLElement;
      
      // Mesma lógica de segurança
      if (
        el.id !== 'root' && 
        el.tagName !== 'SCRIPT' && 
        el.tagName !== 'STYLE' && 
        !el.hasAttribute('data-react-portal')
      ) {
        // Oculta o elemento intrusivo
        el.style.display = 'none';
        el.style.visibility = 'hidden';
        el.style.zIndex = '-9999';
        el.style.pointerEvents = 'none';
        console.log('MoonFlix: Anúncio ocultado com sucesso.');
      }
    });

    // Atualiza estado local para esconder o botão imediatamente
    setShowButton(false);
  };

  if (!showButton) return null;

  return (
    <button
      onClick={clearOverlays}
      className="fixed bottom-4 right-4 z-[100000] bg-red-600/90 hover:bg-red-700 text-white backdrop-blur-md px-3 py-2 rounded-lg shadow-lg border border-red-400/30 flex items-center gap-1.5 transition-all active:scale-90 animate-in slide-in-from-bottom-10 fade-in duration-500"
    >
      <ShieldX size={14} className="animate-pulse" />
      <span className="text-[10px] font-bold uppercase tracking-wide">Fechar</span>
    </button>
  );
};