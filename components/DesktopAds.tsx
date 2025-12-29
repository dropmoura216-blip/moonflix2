import React, { useEffect } from 'react';

export const DesktopAds: React.FC = () => {
  useEffect(() => {
    // Verifica se é mobile baseado no User Agent ou largura da tela
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 1024;

    // Se for mobile, NÃO carrega nada
    if (isMobile) {
      return;
    }

    console.log("MoonFlix: Carregando anúncios para Desktop...");

    // Função auxiliar para injetar Meta tags
    const addMeta = (name: string, content: string) => {
      if (!document.querySelector(`meta[name="${name}"]`)) {
        const meta = document.createElement('meta');
        meta.name = name;
        meta.content = content;
        document.head.appendChild(meta);
      }
    };

    // Função auxiliar para injetar Scripts
    const addScript = (src: string) => {
      if (!document.querySelector(`script[src="${src}"]`)) {
        const script = document.createElement('script');
        script.src = src;
        script.setAttribute('data-cfasync', 'false');
        script.async = true;
        document.head.appendChild(script);
      }
    };

    // Injeção dos Metas de Anúncio
    addMeta('monetag', '09c977aab9eb558109370e38049157bb');
    addMeta('admaven-placement', 'Bqjw9qHn9');

    // Injeção dos Scripts de Notificações/Anúncios
    const adScripts = [
      '//dcbbwymp1bhlf.cloudfront.net/?wbbcd=1234279',
      '//dcbbwymp1bhlf.cloudfront.net/?wbbcd=1234282',
      '//dcbbwymp1bhlf.cloudfront.net/?wbbcd=1234287',
      '//dcbbwymp1bhlf.cloudfront.net/?wbbcd=1234288',
      '//dcbbwymp1bhlf.cloudfront.net/?wbbcd=1234294',
      '//dcbbwymp1bhlf.cloudfront.net/?wbbcd=1234295'
    ];

    adScripts.forEach(addScript);

  }, []);

  return null; // Este componente não renderiza nada visualmente
};