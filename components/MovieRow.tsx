import React, { useRef, useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Category, Movie } from '../types';
import { MovieCard } from './MovieCard';

interface MovieRowProps {
  category: Category;
  onMovieClick?: (movie: Movie) => void;
}

export const MovieRow: React.FC<MovieRowProps> = ({ category, onMovieClick }) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkScrollPosition = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setShowLeftArrow(scrollLeft > 20); // Margem menor para aparecer mais cedo
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20);
    }
  };

  useEffect(() => {
    checkScrollPosition();
    window.addEventListener('resize', checkScrollPosition);
    return () => window.removeEventListener('resize', checkScrollPosition);
  }, [category.movies]);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { current } = rowRef;
      const scrollAmount = direction === 'left' 
        ? -(current.clientWidth * 0.75) 
        : (current.clientWidth * 0.75);
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!category.movies || category.movies.length === 0) return null;

  return (
    <div className="py-4 md:py-8 group/row relative animate-in fade-in duration-700">
      
      {/* Title Section - Only render if title exists */}
      {category.title && (
        <div className="px-4 md:px-12 mb-3 md:mb-5 flex items-center justify-between">
            <h2 className="text-lg md:text-xl font-bold text-gray-100 flex items-center gap-3 group-hover/row:text-white transition-colors cursor-pointer">
            <span className="w-1.5 h-1.5 bg-brand rounded-full shadow-[0_0_10px_#A663CC]"></span>
            {category.title}
            <ChevronRight size={18} className="text-brand opacity-0 group-hover/row:opacity-100 -translate-x-2 group-hover/row:translate-x-0 transition-all duration-300" />
            </h2>
        </div>
      )}

      {/* Slider Container */}
      <div className="relative group/slider">
        
        {/* Navigation Arrows (Visible on Mobile + Desktop) */}
        <div className="pointer-events-none absolute inset-0 z-40">
            {/* Left Arrow */}
            <div className={`absolute left-0 md:left-2 top-0 bottom-0 flex items-center transition-opacity duration-300 ${showLeftArrow ? 'opacity-100' : 'opacity-0'}`}>
                <button 
                    onClick={(e) => { e.stopPropagation(); scroll('left'); }}
                    className="pointer-events-auto w-8 h-8 md:w-12 md:h-12 rounded-full bg-black/90 backdrop-blur-md border border-brand/30 flex items-center justify-center text-brand hover:bg-brand hover:text-white hover:border-brand hover:scale-110 transition-all shadow-xl active:scale-95 group ml-2 md:ml-0"
                    aria-label="Rolar para esquerda"
                >
                    <ChevronLeft size={20} className="md:w-6 md:h-6 group-hover:-translate-x-0.5 transition-transform" />
                </button>
            </div>

            {/* Right Arrow */}
            <div className={`absolute right-0 md:right-2 top-0 bottom-0 flex items-center transition-opacity duration-300 ${showRightArrow ? 'opacity-100' : 'opacity-0'}`}>
                <button 
                    onClick={(e) => { e.stopPropagation(); scroll('right'); }}
                    className="pointer-events-auto w-8 h-8 md:w-12 md:h-12 rounded-full bg-black/90 backdrop-blur-md border border-brand/30 flex items-center justify-center text-brand hover:bg-brand hover:text-white hover:border-brand hover:scale-110 transition-all shadow-xl active:scale-95 group mr-2 md:mr-0"
                    aria-label="Rolar para direita"
                >
                    <ChevronRight size={20} className="md:w-6 md:h-6 group-hover:translate-x-0.5 transition-transform" />
                </button>
            </div>
        </div>

        {/* Scrollable Area */}
        <div 
          ref={rowRef}
          onScroll={checkScrollPosition}
          className="flex gap-3 md:gap-5 overflow-x-auto no-scrollbar px-4 md:px-12 scroll-smooth pb-4 pt-1"
        >
          {category.movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} onClick={onMovieClick} />
          ))}
          
          {/* Spacer */}
          <div className="w-8 md:w-12 flex-shrink-0" />
        </div>

      </div>
    </div>
  );
};