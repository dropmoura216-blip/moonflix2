import React from 'react';
import { Play, Info } from 'lucide-react';
import { Button } from './Button';
import { Movie } from '../types';

interface HeroProps {
  movie: Movie;
  onPlayClick: (movie: Movie) => void;
  isLoading?: boolean;
}

export const Hero: React.FC<HeroProps> = ({ movie, onPlayClick, isLoading = false }) => {
  const bgImage = movie.backdropUrl || movie.imageUrl;

  return (
    <div className="relative w-full h-[55vh] md:h-[75vh] lg:h-[85vh] overflow-hidden group">
      
      {/* Background Image Layer */}
      <div className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        <img 
          src={bgImage} 
          alt={movie.title} 
          className="w-full h-full object-cover object-top"
          loading="eager"
          // @ts-ignore
          fetchPriority="high"
        />
        
        {/* Advanced Matte Gradients */}
        {/* 1. Bottom Fade to Black */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent"></div>
        {/* 2. Left Vignette for Text Readability - Intensified slightly for clearer text */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent"></div>
        {/* 3. Top subtle fade */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent h-32"></div>
      </div>

      {/* Content Layer */}
      <div className="absolute bottom-0 left-0 w-full px-4 md:px-12 pb-16 md:pb-24 z-10 flex flex-col items-start gap-3 md:gap-5">
        
        {/* Tags - Size adjusted back to small and crisp */}
        <div className="flex items-center gap-3 text-[10px] md:text-xs font-bold tracking-widest uppercase animate-in slide-in-from-left-4 duration-500 delay-100">
           <span className="bg-brand text-white px-2 py-0.5 rounded-sm shadow-lg shadow-brand/20">Novo</span>
           <span className="text-gray-300 border-l border-white/20 pl-3">{movie.genre}</span>
        </div>

        {/* Title - Reduced to fit better (3xl mobile, 5xl desktop, 7xl large) */}
        <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold text-white max-w-4xl leading-[1.1] drop-shadow-2xl animate-in slide-in-from-bottom-4 duration-700 delay-200">
          {movie.title}
        </h1>

        {/* Description - Text-sm mobile, text-lg desktop */}
        <p className="text-gray-300 text-sm md:text-lg max-w-2xl line-clamp-3 leading-relaxed drop-shadow-md animate-in slide-in-from-bottom-4 duration-700 delay-300">
          {movie.description}
        </p>

        {/* Buttons */}
        <div className="flex items-center gap-4 mt-4 animate-in fade-in duration-1000 delay-500">
          <Button 
            variant="primary" 
            icon={<Play size={20} className="fill-current" />}
            onClick={() => onPlayClick(movie)}
          >
            Assistir
          </Button>
          <Button 
            variant="secondary" 
            icon={<Info size={20} />}
            onClick={() => onPlayClick(movie)}
          >
            Detalhes
          </Button>
        </div>
      </div>
    </div>
  );
};