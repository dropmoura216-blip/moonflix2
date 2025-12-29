import React, { useState, useEffect, useRef, memo } from 'react';
import { Movie } from '../types';
import { TmdbService } from '../services/tmdb';
import { Film } from 'lucide-react';

interface MovieCardProps {
  movie: Movie;
  onClick?: (movie: Movie) => void;
  variant?: 'row' | 'grid';
}

// Memoized para evitar re-render desnecessário em listas grandes
export const MovieCard: React.FC<MovieCardProps> = memo(({ movie: initialMovie, onClick, variant = 'row' }) => {
  const [movie, setMovie] = useState<Movie>(initialMovie);
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [hasFetched, setHasFetched] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const needsFetching = movie.imdbId && movie.imageUrl.includes('unsplash');

  const widthClass = variant === 'grid' 
    ? 'w-full' 
    : 'w-[160px] md:w-[200px] lg:w-[240px]'; 

  useEffect(() => {
    setMovie(initialMovie);
    if (initialMovie.id !== movie.id) {
        setImageState('loading');
    }
  }, [initialMovie]);

  // Lazy Load Data Logic
  useEffect(() => {
    if (!needsFetching || hasFetched) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setHasFetched(true);
          observer.disconnect();
          
          if (movie.imdbId) {
            TmdbService.getMovieDetails(movie.imdbId, movie)
                .then((enriched) => setMovie(enriched))
                .catch(() => {});
          }
        }
      },
      { rootMargin: '400px' } // Margem reduzida para não carregar coisas muito longe
    );

    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [needsFetching, hasFetched, movie.imdbId, movie]);

  return (
    <div 
      ref={cardRef}
      className={`flex-none ${widthClass} cursor-pointer group/card relative content-visibility-auto`}
      onClick={() => onClick?.(movie)}
    >
      <div className="relative aspect-poster rounded-lg overflow-hidden bg-[#121212] border border-white/5 group-hover/card:border-brand/50 transition-colors shadow-lg">
        
        {imageState === 'loading' && (
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-[shimmer_1.5s_infinite] z-0" />
        )}

        {imageState === 'error' && (
           <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1a1a1a] text-gray-500 p-2 text-center">
              <Film size={24} className="mb-2 opacity-30" />
              <span className="text-[10px] font-bold uppercase tracking-wider line-clamp-2 text-gray-400">
                  {movie.title}
              </span>
           </div>
        )}

        {imageState !== 'error' && (
            <img 
            src={movie.imageUrl} 
            alt={movie.title}
            loading="lazy"
            decoding="async"
            className={`w-full h-full object-cover transition-all duration-500 ease-out group-hover/card:scale-105 ${
                imageState === 'loaded' ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageState('loaded')}
            onError={(e) => {
                e.currentTarget.style.display = 'none';
                setImageState('error');
            }}
            />
        )}
        
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center z-10 p-2">
            <div className="w-10 h-10 rounded-full bg-brand flex items-center justify-center scale-75 group-hover/card:scale-100 transition-transform duration-300 shadow-xl mb-2">
                <svg width="14" height="16" viewBox="0 0 12 14" fill="none" className="ml-0.5 text-white">
                    <path d="M11 6.26795C11.6667 6.65285 11.6667 7.6151 11 8.00001L1.25 13.6292C0.583332 14.0141 -0.250001 13.5329 -0.250001 12.7635L-0.250001 1.50449C-0.250001 0.735071 0.583332 0.253928 1.25 0.638829L11 6.26795Z" fill="currentColor"/>
                </svg>
            </div>
            <p className="text-white text-[10px] font-bold text-center leading-tight">
                {movie.year || '2024'}
            </p>
            <div className="flex items-center gap-1 mt-1">
                <span className="text-brand text-[10px]">★</span>
                <span className="text-gray-300 text-[10px]">{movie.rating || 'N/A'}</span>
            </div>
        </div>
      </div>
      
      <div className="mt-2 px-0.5">
        <h3 className="text-gray-300 text-xs md:text-sm font-medium truncate group-hover/card:text-white transition-colors">
          {movie.title}
        </h3>
      </div>
    </div>
  );
});