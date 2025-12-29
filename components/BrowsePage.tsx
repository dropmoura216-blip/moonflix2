import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Movie } from '../types';
import { MovieCard } from './MovieCard';
import { Film, Tv, ChevronDown, Zap, Smile } from 'lucide-react';
import { Button } from './Button';

interface BrowsePageProps {
  allMovies: Movie[];
  onMovieClick: (movie: Movie) => void;
  initialTab?: 'movies' | 'series' | 'animes' | 'cartoons';
  initialGenre?: string;
}

type SortByType = 'popularity' | 'release_date' | 'title_asc';

const FilterDropdown: React.FC<{
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  label: string;
}> = ({ options, value, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLabel = options.find(opt => opt.value === value)?.label || label;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-2 px-4 py-2 bg-secondary/50 border border-white/10 rounded-lg text-sm text-gray-300 hover:bg-secondary hover:text-white transition-colors w-full md:w-48"
      >
        <span>{selectedLabel}</span>
        <ChevronDown size={16} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-full max-h-60 overflow-y-auto bg-[#1a1a1a] border border-white/10 rounded-lg shadow-2xl z-50 p-1 animate-in fade-in-5 zoom-in-95 duration-200">
          {options.map(option => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                value === option.value ? 'bg-brand/20 text-brand font-semibold' : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const BrowsePage: React.FC<BrowsePageProps> = ({ allMovies, onMovieClick, initialTab = 'movies', initialGenre = 'all' }) => {
  const [activeTab, setActiveTab] = useState<'movies' | 'series' | 'animes' | 'cartoons'>(initialTab);
  const [sortBy, setSortBy] = useState<SortByType>('popularity');
  const [selectedGenre, setSelectedGenre] = useState<string>(initialGenre);
  const [visibleCount, setVisibleCount] = useState(30);
  const ITEMS_PER_PAGE = 30;

  // Cálculos de contagem otimizados (executa apenas quando allMovies.length muda drasticamente)
  const counts = useMemo(() => ({
      movies: allMovies.filter(m => !m.type || m.type === 'movie').length,
      series: allMovies.filter(m => m.type === 'series').length,
      animes: allMovies.filter(m => m.type === 'anime').length,
      cartoons: allMovies.filter(m => m.type === 'cartoon').length
  }), [allMovies.length]); // Dependência leve

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (initialGenre) {
        setSelectedGenre(initialGenre);
    }
  }, [initialGenre]);

  // Lista de gêneros (Calculada apenas uma vez ou quando a aba muda)
  const allGenres = useMemo(() => {
    const genres = new Set<string>();
    // Amostragem para performance: Não iterar 50k itens, pega os primeiros 2000 que já tem uma boa variedade
    const sample = allMovies.slice(0, 5000);
    
    sample
      .filter(m => {
          if (activeTab === 'movies') return (!m.type || m.type === 'movie');
          if (activeTab === 'series') return m.type === 'series';
          if (activeTab === 'animes') return m.type === 'anime';
          if (activeTab === 'cartoons') return m.type === 'cartoon';
          return false;
      })
      .forEach(movie => {
        (movie.genres || [movie.genre]).forEach(g => {
          if (g) genres.add(g);
        });
      });
    return [{ value: 'all', label: 'Todos os Gêneros' }, ...Array.from(genres).sort().map(g => ({ value: g, label: g }))];
  }, [allMovies.length, activeTab]); // Dependência leve

  const sortOptions = [
    { value: 'popularity', label: 'Mais Populares' },
    { value: 'release_date', label: 'Lançamentos' },
    { value: 'title_asc', label: 'A-Z' },
  ];

  // Filtragem e Ordenação Otimizada
  const filteredAndSortedMovies = useMemo(() => {
    // 1. Filtrar por Tipo (Primeiro filtro, reduz drasticamente o array)
    let filtered = allMovies.filter(m => {
        if (activeTab === 'movies') return (!m.type || m.type === 'movie');
        if (activeTab === 'series') return m.type === 'series';
        if (activeTab === 'animes') return m.type === 'anime';
        if (activeTab === 'cartoons') return m.type === 'cartoon';
        return false;
    });

    // 2. Filtrar por Gênero
    if (selectedGenre !== 'all') {
      filtered = filtered.filter(movie =>
        (movie.genres || [movie.genre]).includes(selectedGenre)
      );
    }

    // 3. Ordenar
    // Para performance, se for "Popularidade" (padrão) e não tiver dados de rating confiáveis em massa,
    // podemos pular a ordenação complexa ou limitar a ordenação.
    // Aqui fazemos uma ordenação segura.
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'release_date':
          return (b.year || 0) - (a.year || 0);
        case 'title_asc':
          return a.title.localeCompare(b.title);
        case 'popularity':
        default:
          // Simplificação: Assume que a ordem de inserção (constants) já tem alguma relevância ou é aleatória
          // Se tiver rating, usa.
          const scoreA = (parseFloat(a.rating || '0'));
          const scoreB = (parseFloat(b.rating || '0'));
          return scoreB - scoreA;
      }
    });
  }, [allMovies, activeTab, selectedGenre, sortBy]);

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + ITEMS_PER_PAGE);
  };
  
  const hasMore = visibleCount < filteredAndSortedMovies.length;

  return (
    <div className="min-h-screen bg-background pt-24 pb-28 px-4 md:px-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-full max-w-[2400px] mx-auto">
        
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white">Catálogo</h1>
          <div className="mt-4 border-b border-white/10">
            <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
              <button
                onClick={() => { setActiveTab('movies'); setSelectedGenre('all'); setVisibleCount(30); }}
                className={`flex items-center gap-2 px-1 py-3 text-sm font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'movies' ? 'text-brand border-b-2 border-brand' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Film size={16} /> 
                Filmes
                <span className={`ml-1.5 text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                  activeTab === 'movies' 
                    ? 'bg-brand/20 text-brand border-brand/30' 
                    : 'bg-white/10 text-gray-400 border-white/10'
                }`}>
                  {counts.movies}
                </span>
              </button>
              <button
                onClick={() => { setActiveTab('series'); setSelectedGenre('all'); setVisibleCount(30); }}
                className={`flex items-center gap-2 px-1 py-3 text-sm font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'series' ? 'text-brand border-b-2 border-brand' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Tv size={16} /> 
                Séries
                <span className={`ml-1.5 text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                  activeTab === 'series' 
                    ? 'bg-brand/20 text-brand border-brand/30' 
                    : 'bg-white/10 text-gray-400 border-white/10'
                }`}>
                  {counts.series}
                </span>
              </button>
              <button
                onClick={() => { setActiveTab('animes'); setSelectedGenre('all'); setVisibleCount(30); }}
                className={`flex items-center gap-2 px-1 py-3 text-sm font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'animes' ? 'text-brand border-b-2 border-brand' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Zap size={16} /> 
                Animes
                <span className={`ml-1.5 text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                  activeTab === 'animes' 
                    ? 'bg-brand/20 text-brand border-brand/30' 
                    : 'bg-white/10 text-gray-400 border-white/10'
                }`}>
                  {counts.animes}
                </span>
              </button>
              <button
                onClick={() => { setActiveTab('cartoons'); setSelectedGenre('all'); setVisibleCount(30); }}
                className={`flex items-center gap-2 px-1 py-3 text-sm font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'cartoons' ? 'text-brand border-b-2 border-brand' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Smile size={16} /> 
                Desenhos
                <span className={`ml-1.5 text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                  activeTab === 'cartoons' 
                    ? 'bg-brand/20 text-brand border-brand/30' 
                    : 'bg-white/10 text-gray-400 border-white/10'
                }`}>
                  {counts.cartoons}
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <h2 className="text-lg font-semibold text-white w-full md:w-auto">
            {activeTab === 'movies' && (selectedGenre !== 'all' ? `Filmes de ${selectedGenre}` : 'Todos os Filmes')}
            {activeTab === 'series' && (selectedGenre !== 'all' ? `Séries de ${selectedGenre}` : 'Todas as Séries')}
            {activeTab === 'animes' && (selectedGenre !== 'all' ? `Animes de ${selectedGenre}` : 'Todos os Animes')}
            {activeTab === 'cartoons' && (selectedGenre !== 'all' ? `Desenhos de ${selectedGenre}` : 'Todos os Desenhos')}
          </h2>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <FilterDropdown options={allGenres} value={selectedGenre} onChange={setSelectedGenre} label="Gênero" />
            <FilterDropdown options={sortOptions} value={sortBy} onChange={(val) => setSortBy(val as SortByType)} label="Ordenar por" />
          </div>
        </div>

        {/* Content */}
        {filteredAndSortedMovies.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 3xl:grid-cols-8 4xl:grid-cols-9 gap-x-4 gap-y-8">
              {filteredAndSortedMovies.slice(0, visibleCount).map(movie => (
                <MovieCard key={`${movie.id}-${movie.title}`} movie={movie} variant="grid" onClick={onMovieClick} />
              ))}
            </div>
            {hasMore && (
              <div className="text-center mt-12">
                <Button onClick={handleLoadMore} variant="secondary">
                  Carregar Mais
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 text-gray-500">
            <p>Nenhum título encontrado com os filtros selecionados.</p>
          </div>
        )}
      </div>
    </div>
  );
};