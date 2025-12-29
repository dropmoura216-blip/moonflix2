import React, { useState } from 'react';
import { Play, Wifi, ShieldCheck, Loader2, Maximize2, Volume2, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from './AuthModal';
import { SubscriptionModal } from './SubscriptionModal';

interface VideoPlayerProps {
  src: string;
  poster: string;
  backdrop?: string;
  title: string;
}

const AD_LINKS = [
  "https://tertheyhadgoneh.com?esb3s=1234292",
  "https://tertheyhadgoneh.com?fJMU8=1234291",
  "https://tertheyhadgoneh.com?Px4tB=1234284"
];

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, poster, backdrop, title }) => {
  const { user, isPremium } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [adStep, setAdStep] = useState(0);

  // Define a imagem de fundo: prefere backdrop (horizontal) para o player
  const bgImage = backdrop || poster;
  
  // Detecta se é embed (iframe) ou link externo
  // Adicionado superflixapi.buzz para garantir que abra no iframe
  const isEmbed = src && (
    src.includes('playerflixapi.com') || 
    src.includes('superflixapi.buzz') || 
    src.includes('embed') || 
    src.includes('youtube') || 
    src.includes('vimeo')
  );

  const getAutoplayUrl = (url: string) => {
    if (!url) return '';
    // Adiciona parâmetros de autoplay dependendo se já existem query params na URL
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}autoplay=1&muted=0`;
  };

  const handlePlayClick = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    // Lógica de Anúncios para usuários NÃO Premium
    if (!isPremium) {
      if (adStep < AD_LINKS.length) {
        window.open(AD_LINKS[adStep], '_blank');
        setAdStep(prev => prev + 1);
        return;
      }
      // Se já abriu todos os anúncios, permite assistir (modelo Freemium com Ads)
    }

    // Se for premium, pula os anúncios.
    // Se não for premium mas completou os passos, toca o vídeo.

    if (!src) return;

    if (isEmbed) {
      setIsLoading(true);
      setIsPlaying(true);
    } else {
      window.open(src, '_blank');
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    // Não inicia automaticamente após login se não for premium,
    // o usuário terá que clicar de novo e passará pela lógica de ads.
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  return (
    <>
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        onSuccess={handleAuthSuccess}
      />
      
      <SubscriptionModal 
        isOpen={showSubscriptionModal} 
        onClose={() => setShowSubscriptionModal(false)} 
      />

      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 group select-none ring-1 ring-white/5">
        
        {!isPlaying ? (
          // --- ESTADO 1: CAPA (COVER) ---
          <div 
            className="absolute inset-0 z-20 cursor-pointer"
            onClick={handlePlayClick}
          >
            {/* Background Image with Slow Zoom Effect */}
            <div className="absolute inset-0 overflow-hidden">
              <img 
                src={bgImage} 
                alt={title} 
                className="w-full h-full object-cover transition-transform duration-[3000ms] ease-out group-hover:scale-105 opacity-60"
              />
              {/* Gradient Overlays for Readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/20 to-transparent" />
              <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/40" />
            </div>

            {/* Center Action */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-30">
              
              {/* Play Button Container */}
              <div className="relative group/btn">
                  {/* Pulse Ring */}
                  <div className="absolute inset-0 bg-brand/50 rounded-full animate-ping opacity-20 duration-1000"></div>
                  
                  {/* Main Button */}
                  <div className="relative w-20 h-20 md:w-24 md:h-24 bg-white/10 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center transition-all duration-300 group-hover/btn:scale-110 group-hover/btn:bg-brand group-hover/btn:border-brand shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                    <Play size={36} className="ml-2 text-white fill-white" />
                  </div>
              </div>

              <div className="mt-8 text-center">
                  <p className="text-white/90 font-bold text-sm tracking-[0.2em] uppercase group-hover:text-white transition-colors drop-shadow-lg flex items-center justify-center gap-2">
                      Clique para reproduzir agora
                  </p>
                  {!isPremium && adStep < AD_LINKS.length && adStep > 0 && (
                    <p className="text-brand text-xs mt-2 font-medium animate-pulse">
                      Toque mais {AD_LINKS.length - adStep} vezes para iniciar
                    </p>
                  )}
              </div>
              
              {/* Technical Badges */}
              <div className="absolute bottom-8 flex items-center gap-3 text-[10px] font-bold text-gray-300 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                  <span className="flex items-center gap-1.5"><Wifi size={12} className="text-green-400" /> Servidor Principal</span>
                  <span className="w-px h-3 bg-white/20"></span>
                  <span className="flex items-center gap-1.5"><Maximize2 size={12} /> 4K Ultra HD</span>
                  <span className="w-px h-3 bg-white/20"></span>
                  <span className="flex items-center gap-1.5"><Volume2 size={12} /> Dolby 5.1</span>
              </div>
            </div>

            {/* Corner Info */}
            <div className="absolute top-4 right-4 z-30">
              <div className="flex items-center gap-2 text-[10px] text-gray-400 bg-black/40 px-3 py-1 rounded-full border border-white/5">
                <ShieldCheck size={12} className="text-brand" /> Reprodução Segura
              </div>
            </div>

          </div>
        ) : (
          // --- ESTADO 2: IFRAME ATIVO (AUTOPLAY) ---
          <div className="absolute inset-0 z-30 bg-black w-full h-full">
              {/* Loading Spinner (While iframe loads) */}
              {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505] z-40">
                    <Loader2 size={48} className="text-brand animate-spin mb-4" />
                    <p className="text-gray-400 text-sm animate-pulse tracking-wide">Estabelecendo conexão segura...</p>
                </div>
              )}

              <iframe 
                  src={getAutoplayUrl(src)} 
                  className={`w-full h-full transition-opacity duration-700 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                  frameBorder="0" 
                  scrolling="no"
                  allowFullScreen 
                  allow="autoplay; encrypted-media; picture-in-picture; gyroscope; accelerometer"
                  onLoad={handleIframeLoad}
                  title={title}
              />
          </div>
        )}
      </div>
    </>
  );
};