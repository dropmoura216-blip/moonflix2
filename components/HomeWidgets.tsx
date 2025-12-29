import React, { useRef, useState, useEffect } from 'react';
import { ShieldCheck, Monitor, Smartphone, Download, Star, ChevronRight, PlayCircle, ExternalLink, Play, Plus, Info, ChevronLeft, TrendingUp } from 'lucide-react';
import { Movie } from '../types';
import { MovieCard } from './MovieCard';
import { NEWS_UPDATES } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { SubscriptionModal } from './SubscriptionModal';

// 1. Benefits Bar (Icons under hero)
export const BenefitsBar: React.FC = () => {
  const benefits = [
    { icon: <Monitor size={20} />, text: "Assista na TV" },
    { icon: <Smartphone size={20} />, text: "Baixe no App" },
    { icon: <ShieldCheck size={20} />, text: "Perfis Infantis" },
    { icon: <Star size={20} />, text: "Conteúdo 4K" },
  ];

  return (
    <div className="w-full bg-gradient-to-r from-secondary/50 via-secondary/20 to-secondary/50 backdrop-blur-sm border-y border-white/5 py-6">
      <div className="w-full max-w-[2400px] mx-auto px-4 flex justify-between md:justify-center md:gap-16 overflow-x-auto no-scrollbar">
        {benefits.map((b, i) => (
          <div key={i} className="flex flex-col md:flex-row items-center gap-2 md:gap-3 text-gray-400 min-w-[80px] flex-shrink-0">
            <div className="text-brand mb-1 md:mb-0">{b.icon}</div>
            <span className="text-[10px] md:text-sm font-medium uppercase tracking-wide whitespace-nowrap">{b.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// 2. Mini Banners Grid (Featured Collections)
export const FeaturedCollections: React.FC = () => {
  
  const handleInstallTrigger = () => {
    const event = new Event('moonflix-trigger-install');
    window.dispatchEvent(event);
  };

  return (
    <div className="w-full max-w-[2400px] mx-auto px-4 md:px-12 py-8 md:py-12">
      <h3 className="text-white font-bold text-lg md:text-xl mb-4 md:mb-6 flex items-center gap-2">
        <span className="w-1 h-6 bg-brand rounded-full"></span>
        Coleções em Destaque
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1 */}
        <div className="relative h-48 md:h-56 rounded-xl overflow-hidden group cursor-pointer border border-white/5">
          <img 
            src="https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=800" 
            alt="Sci-Fi" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent">
            <div className="absolute bottom-4 left-4">
              <span className="text-brand text-xs font-bold uppercase tracking-wider mb-1 block">Maratona</span>
              <h4 className="text-white font-bold text-xl md:text-2xl">Universo Sci-Fi</h4>
              <p className="text-gray-300 text-xs mt-1">Viagens intergalácticas e futuros distópicos.</p>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="relative h-48 md:h-56 rounded-xl overflow-hidden group cursor-pointer border border-white/5">
          <img 
            src="https://i.postimg.cc/W44Q0TR3/supawork-4bc08de0f58e4cef84eaf7236b3199db.png" 
            alt="Indie" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent">
             <div className="absolute bottom-4 left-4">
              <span className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-1 block">Exclusivo</span>
              <h4 className="text-white font-bold text-xl md:text-2xl">Cinema Indie</h4>
              <p className="text-gray-300 text-xs mt-1">Jóias raras premiadas em festivais.</p>
            </div>
          </div>
        </div>

        {/* Card 3 (Promo - Install App) */}
        <div 
          onClick={handleInstallTrigger}
          className="relative h-48 md:h-56 rounded-xl overflow-hidden group cursor-pointer border border-brand/20 bg-brand/5 hover:bg-brand/10 transition-colors"
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
             <div className="w-12 h-12 rounded-full bg-brand flex items-center justify-center text-white mb-3 shadow-lg shadow-brand/30 group-hover:scale-110 transition-transform">
                <Download size={24} />
             </div>
             <h4 className="text-white font-bold text-xl">MoonFlix Mobile</h4>
             <p className="text-gray-400 text-sm mt-2 mb-4">Baixe seus filmes favoritos para assistir offline no avião ou metrô.</p>
             <span className="text-brand text-xs font-bold uppercase flex items-center gap-1 group-hover:text-white transition-colors">
               Baixar Agora <ChevronRight size={14} />
             </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. Trending Spotlight (Substituto elegante do Top 10)
interface TrendingSpotlightProps {
  movies: Movie[];
  onMovieClick: (movie: Movie) => void;
}

export const TrendingSpotlight: React.FC<TrendingSpotlightProps> = ({ movies, onMovieClick }) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  if (!movies || movies.length === 0) return null;

  const checkScrollPosition = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setShowLeftArrow(scrollLeft > 20);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="py-8 md:py-12 relative z-10 group/section">
      <div className="w-full max-w-[2400px] mx-auto px-4 md:px-12">
        
        {/* Header Section */}
        <div className="flex items-center gap-3 mb-6">
           <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand to-purple-800 flex items-center justify-center shadow-lg shadow-brand/20">
              <TrendingUp size={20} className="text-white" />
           </div>
           <div>
              <h3 className="text-white font-bold text-xl md:text-2xl tracking-tight">Destaques da Semana</h3>
              <p className="text-gray-400 text-xs md:text-sm">Os filmes mais assistidos e comentados.</p>
           </div>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          
           {/* Navigation Buttons */}
           <div className="hidden md:block">
              <button 
                 onClick={() => scroll('left')}
                 className={`absolute -left-5 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center text-white shadow-xl hover:bg-brand hover:border-brand transition-all duration-300 ${showLeftArrow ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'}`}
              >
                 <ChevronLeft size={24} />
              </button>
              <button 
                 onClick={() => scroll('right')}
                 className={`absolute -right-5 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center text-white shadow-xl hover:bg-brand hover:border-brand transition-all duration-300 ${showRightArrow ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}`}
              >
                 <ChevronRight size={24} />
              </button>
           </div>

           {/* Cards Row */}
           <div 
             ref={rowRef}
             onScroll={checkScrollPosition}
             className="flex gap-4 overflow-x-auto no-scrollbar pb-8 pt-2 scroll-smooth"
           >
              {movies.map((movie, index) => (
                 <div 
                   key={movie.id}
                   onClick={() => onMovieClick(movie)}
                   className="flex-none w-[280px] md:w-[360px] relative group cursor-pointer"
                 >
                    {/* Image Container */}
                    <div className="aspect-video rounded-2xl overflow-hidden bg-secondary border border-white/5 relative shadow-lg group-hover:shadow-brand/20 transition-all duration-300 group-hover:-translate-y-2">
                       <img 
                         src={movie.backdropUrl || movie.imageUrl} 
                         alt={movie.title}
                         className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                         loading="lazy"
                       />
                       
                       {/* Overlay Gradient */}
                       <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>
                       
                       {/* Content Overlay */}
                       <div className="absolute bottom-0 left-0 right-0 p-5">
                          <h4 className="text-white font-bold text-lg leading-tight mb-1 truncate shadow-black drop-shadow-md">
                            {movie.title}
                          </h4>
                          <div className="flex items-center gap-3 text-xs font-medium text-gray-300">
                             <span className="text-brand font-bold">#{index + 1}</span>
                             <span>•</span>
                             <span>{movie.year}</span>
                             <span>•</span>
                             <div className="flex items-center gap-1 text-yellow-500">
                               <Star size={10} fill="currentColor" /> {movie.rating}
                             </div>
                          </div>
                       </div>

                       {/* Play Button (Hover) */}
                       <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40 text-white shadow-xl">
                             <Play size={24} fill="currentColor" className="ml-1" />
                          </div>
                       </div>
                    </div>
                 </div>
              ))}
              <div className="w-8 flex-shrink-0"></div>
           </div>

        </div>
      </div>
    </div>
  );
};

// 4. Content with Sidebar
interface SidebarLayoutProps {
  movies: Movie[];
  onMovieClick: (movie: Movie) => void;
}

export const ContentWithSidebar: React.FC<SidebarLayoutProps> = ({ movies, onMovieClick }) => {
  const gridMovies = movies ? movies.slice(0, 4) : [];
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const { isPremium } = useAuth();

  return (
    <div className="w-full max-w-[2400px] mx-auto px-4 md:px-12 py-10 border-t border-white/5">
      
      <SubscriptionModal isOpen={showSubscriptionModal} onClose={() => setShowSubscriptionModal(false)} />

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Main Content */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
             <h3 className="text-white font-bold text-xl flex items-center gap-2">
               <PlayCircle className="text-brand" size={20} />
               Adicionados Recentemente
             </h3>
             <button className="text-xs text-brand hover:text-white transition-colors">Ver todos</button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 3xl:grid-cols-5 gap-4">
            {gridMovies.map(movie => (
              <MovieCard key={movie.id} movie={movie} onClick={onMovieClick} />
            ))}
          </div>

          {!isPremium && (
            <div className="mt-8 relative rounded-xl overflow-hidden bg-gradient-to-r from-purple-900 to-blue-900 p-6 flex flex-col md:flex-row items-center justify-between gap-4 border border-white/10 shadow-2xl">
                <div className="text-center md:text-left z-10">
                <h4 className="text-white font-bold text-lg">MoonFlix Premium</h4>
                <p className="text-purple-200 text-sm mt-1">Todos os filmes, séries e animes por apenas R$ 12,90.</p>
                </div>
                <button 
                    onClick={() => setShowSubscriptionModal(true)}
                    className="px-5 py-2 bg-white text-purple-900 font-bold rounded-full text-sm hover:bg-gray-100 transition-colors z-10"
                >
                Assinar Agora
                </button>
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand/30 rounded-full blur-3xl -mr-10 -mt-10"></div>
            </div>
          )}
        </div>

        {/* Right Column: Sidebar */}
        <div className="w-full lg:w-[320px] flex-shrink-0 flex flex-col gap-6">
           
           <div className="bg-secondary/30 rounded-xl p-5 border border-white/5">
              <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4 flex items-center justify-between">
                Novidades MoonFlix
                <ExternalLink size={12} />
              </h4>
              <div className="flex flex-col gap-4">
                {NEWS_UPDATES?.map(news => (
                  <div key={news.id} className="group cursor-pointer">
                    <div className="flex gap-3 items-start">
                       <div className="w-16 h-12 rounded bg-gray-800 overflow-hidden flex-shrink-0">
                         <img src={news.image} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                       </div>
                       <div>
                         <h5 className="text-sm font-medium text-gray-200 group-hover:text-brand transition-colors line-clamp-2 leading-tight">
                           {news.title}
                         </h5>
                         <span className="text-[10px] text-gray-500 mt-1 block">{news.time}</span>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
           </div>

           <div className="bg-[#0f1110] rounded-xl p-1 border border-white/5">
             <div className="bg-gradient-to-b from-transparent to-black/80 rounded-lg p-4 relative overflow-hidden h-64 flex flex-col justify-end">
                <img 
                  src="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=600" 
                  alt="Game Ad" 
                  className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
                <div className="relative z-10">
                  <span className="px-2 py-0.5 bg-yellow-500 text-black text-[10px] font-bold rounded mb-2 inline-block">PARCEIRO</span>
                  <h4 className="text-white font-bold text-lg">Moon Gaming</h4>
                  <p className="text-gray-300 text-xs mt-1 mb-3">Jogue títulos exclusivos inclusos na sua assinatura.</p>
                  <button className="w-full py-2 bg-secondary/80 hover:bg-white text-white hover:text-black text-xs font-bold rounded border border-white/20 transition-all">
                    Conhecer Jogos
                  </button>
                </div>
             </div>
           </div>

        </div>

      </div>
    </div>
  );
};

// 5. Immersive Break
interface ImmersiveBreakProps {
  onMovieClick: (movie: Movie) => void;
}

export const ImmersiveBreak: React.FC<ImmersiveBreakProps> = ({ onMovieClick }) => {
   const promoMovie: Movie = {
        id: 'promo-interstellar',
        title: 'Interestelar',
        description: 'As reservas de comida da Terra estão acabando e o jeito é explorar outros planetas. Um grupo de astronautas viaja por um buraco de minhoca em busca de um novo lar para a humanidade.',
        imageUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniL6E77NI6lCU6MxlNBvIx.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg',
        year: 2014,
        rating: '8.6',
        duration: '2h 49m',
        genre: 'Ficção Científica',
        videoUrl: 'https://playerflixapi.com/filme/tt0816692'
   };

   return (
     <div 
       className="relative w-full h-[60vh] md:h-[70vh] my-10 md:my-16 overflow-hidden group border-y border-white/5"
     >
       <div className="absolute inset-0 w-full h-full">
         <img 
           src={promoMovie.backdropUrl} 
           alt={promoMovie.title} 
           className="w-full h-full object-cover transition-transform duration-[4000ms] group-hover:scale-105"
         />
         <div className="absolute inset-0 bg-gradient-to-t from-[#000807] via-[#000807]/50 to-transparent"></div>
         <div className="absolute inset-0 bg-gradient-to-r from-[#000807] via-[#000807]/60 to-transparent"></div>
       </div>

       <div className="absolute inset-0 flex items-center z-20">
         <div className="w-full max-w-[2400px] mx-auto px-6 md:px-12">
            <div className="max-w-2xl flex flex-col items-start gap-4">
                <div className="flex items-center gap-3 text-xs md:text-sm font-bold tracking-widest uppercase text-gray-300 animate-in slide-in-from-left-4 duration-700">
                    <span className="flex items-center gap-1 text-[#E5B546]">
                        <Star size={14} className="fill-current" /> {promoMovie.rating}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-gray-500"></span>
                    <span>{promoMovie.year}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-500"></span>
                    <span>{promoMovie.genre}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-500"></span>
                    <span className="border border-white/20 px-1.5 py-0.5 rounded text-[10px] text-white">4K ULTRA HD</span>
                </div>
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight drop-shadow-2xl animate-in slide-in-from-bottom-4 duration-700 delay-100">
                    {promoMovie.title}
                </h2>
                <p className="text-gray-300 text-sm md:text-lg leading-relaxed line-clamp-3 md:line-clamp-none max-w-xl animate-in slide-in-from-bottom-4 duration-700 delay-200">
                    {promoMovie.description}
                </p>
                <div className="flex items-center gap-4 mt-4 animate-in fade-in duration-700 delay-300">
                    <button 
                        onClick={() => onMovieClick(promoMovie)}
                        className="flex items-center gap-2 px-6 py-3.5 bg-brand text-white rounded-lg font-bold hover:bg-brand/90 hover:scale-105 transition-all shadow-lg shadow-brand/20 active:scale-95"
                    >
                        <Play size={20} className="fill-current" />
                        Assistir Agora
                    </button>
                    <button 
                        className="flex items-center gap-2 px-6 py-3.5 bg-white/5 border border-white/20 text-white rounded-lg font-bold hover:bg-white/10 hover:border-white/40 transition-all active:scale-95 backdrop-blur-sm"
                    >
                        <Plus size={20} />
                        Minha Lista
                    </button>
                </div>
            </div>
         </div>
       </div>
     </div>
   );
};

// 6. Wide Movie Row (For Continue Watching / Trending)
interface WideRowProps {
  title: string;
  movies: Movie[];
  onMovieClick: (movie: Movie) => void;
  progress?: boolean;
}

export const WideMovieRow: React.FC<WideRowProps> = ({ title, movies, onMovieClick, progress = false }) => {
  return (
    <div className="py-8 md:py-12 border-t border-white/5 relative z-10">
      <div className="w-full max-w-[2400px] mx-auto px-4 md:px-12">
        <h3 className="text-white font-bold text-lg md:text-xl mb-6 flex items-center gap-2">
            {title}
            <ChevronRight size={16} className="text-gray-500" />
        </h3>
        
        <div className="flex gap-4 md:gap-6 overflow-x-auto no-scrollbar pb-4 snap-x snap-mandatory">
          {movies.map((movie, i) => (
             <div 
                key={movie.id} 
                className="flex-none w-[260px] md:w-[320px] group cursor-pointer snap-start"
                onClick={() => onMovieClick(movie)}
             >
                <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-secondary shadow-lg group-hover:shadow-brand/20 transition-all duration-300 group-hover:scale-[1.02]">
                    <img 
                      src={movie.backdropUrl || movie.imageUrl} 
                      alt={movie.title}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                       <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white">
                          <Play size={24} className="fill-current ml-1" />
                       </div>
                    </div>
                    {progress && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                         <div 
                           className="h-full bg-brand" 
                           style={{ width: `${Math.floor(Math.random() * 80) + 10}%` }}
                         ></div>
                      </div>
                    )}
                </div>
                <div className="mt-3">
                   <h4 className="text-white font-bold text-sm truncate">{movie.title}</h4>
                   <p className="text-gray-400 text-xs mt-1 truncate">{movie.genre} • {movie.year}</p>
                </div>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 7. Newsletter Section
export const NewsletterSection: React.FC = () => {
  return (
    <div className="w-full max-w-[2400px] mx-auto px-4 md:px-12 py-16 md:py-24">
      <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-[#0f1110]">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand/10 blur-[120px] rounded-full -mr-20 -mt-20"></div>
         <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 blur-[100px] rounded-full -ml-20 -mb-20"></div>

         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-8 md:p-16 gap-10">
            <div className="max-w-xl text-center md:text-left">
               <span className="text-brand font-bold uppercase tracking-widest text-xs mb-2 block">Fique por dentro</span>
               <h2 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
                 Não perca os lançamentos da semana.
               </h2>
               <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                 Receba notificações sobre novos filmes, séries exclusivas e promoções especiais diretamente no seu e-mail. Sem spam, prometemos.
               </p>
            </div>

            <div className="w-full max-w-md">
               <form className="flex flex-col sm:flex-row gap-3" onSubmit={(e) => e.preventDefault()}>
                  <input 
                    type="email" 
                    placeholder="Seu melhor e-mail" 
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-brand/50 transition-colors"
                  />
                  <button className="bg-white text-black font-bold px-8 py-4 rounded-xl hover:bg-gray-200 transition-colors shadow-lg shadow-white/5">
                    Inscrever
                  </button>
               </form>
               <p className="text-gray-500 text-[10px] mt-4 text-center sm:text-left">
                 Ao se inscrever, você concorda com nossos Termos de Uso e Política de Privacidade.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
};