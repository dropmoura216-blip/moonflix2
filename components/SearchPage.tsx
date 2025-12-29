import React, { useState, useEffect } from 'react';
import { Search, X, TrendingUp, AlertCircle, Loader2, Play } from 'lucide-react';
import { MovieCard } from './MovieCard';
import { Movie } from '../types';
import { TmdbService } from '../services/tmdb';

interface SearchPageProps {
  movies: Movie[]; 
  onMovieClick: (movie: Movie) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

// --- UTILITÁRIOS DE TEXTO ---
const normalize = (str: string | undefined | null) => 
  (str || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

export const SearchPage: React.FC<SearchPageProps> = ({ 
  movies = [], 
  onMovieClick, 
  searchQuery, 
  onSearchChange 
}) => {
  
  const [results, setResults] = useState<Movie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>([]);
  const [showFilters, setShowFilters] = useState(true);

  // Monitora o scroll para esconder/mostrar as sugestões
  useEffect(() => {
    const handleScroll = () => {
       setShowFilters(window.scrollY < 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Recomendações Aleatórias Iniciais
  useEffect(() => {
    if (recommendedMovies.length === 0 && movies.length > 0) {
        const recs = movies
            .filter(m => m.rating && parseFloat(m.rating) > 6.0 && m.imageUrl && !m.imageUrl.includes('unsplash')) 
            .sort(() => 0.5 - Math.random()) 
            .slice(0, 10);
        
        setRecommendedMovies(recs);
    }
  }, [movies]);

  // --- LÓGICA DE BUSCA HÍBRIDA (LOCAL + API) ---
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    const timeoutId = setTimeout(async () => {
      const query = normalize(searchQuery);
      // HACK: Permite que busca por plurais (ex: "Desenhos", "Animes") encontre gêneros singulares ("Desenho", "Anime")
      const querySingular = query.endsWith('s') ? query.slice(0, -1) : query;

      // 1. BUSCA LOCAL (Filmes já carregados no App)
      const localMatches = movies.filter(movie => {
        // Ignora placeholders não carregados na busca local textual
        if (movie.title === 'Carregando...') return false;
        
        const titleNorm = normalize(movie.title);
        const genreNorm = normalize(movie.genre || '');
        const castNorm = (movie.cast || []).map(c => normalize(c));

        return titleNorm.includes(query) || 
               genreNorm.includes(query) || 
               genreNorm.includes(querySingular) ||
               castNorm.some(c => c.includes(query));
      });

      // 2. BUSCA REMOTA (API TMDB) PARA ENCONTRAR FILMES DA LISTA QUE AINDA NÃO CARREGARAM
      // Isso resolve o problema de pesquisar um filme que está na lista de IDs mas ainda aparece como "Carregando..."
      let apiMatches: Movie[] = [];
      
      try {
        const tmdbResults = await TmdbService.searchMovies(searchQuery);
        
        // Pega os top 8 resultados do TMDB para cruzar com nossa lista
        const topResults = tmdbResults.slice(0, 8);
        
        const crossCheckPromises = topResults.map(async (tmdbMovie) => {
            // Verifica se já temos esse filme nos resultados locais (evita duplicata)
            if (localMatches.some(m => normalize(m.title) === normalize(tmdbMovie.title))) {
                return null;
            }

            // Busca o ID IMDB (tt...) desse resultado, passando o tipo para otimizar a velocidade
            const mediaType = tmdbMovie.media_type === 'tv' ? 'tv' : 'movie';
            const imdbId = await TmdbService.getImdbIdFromTmdb(tmdbMovie.id, mediaType);
            
            // Lógica melhorada de Matching:
            // 1. Tenta pelo ID do IMDB (padrão para filmes/séries)
            // 2. Tenta pelo ID do TMDB (usado na lista de Animes, onde o ID na lista é numérico)
            const localMovieEntry = movies.find(m => 
                (imdbId && m.imdbId === imdbId) || 
                (m.imdbId === tmdbMovie.id.toString())
            );
            
            if (localMovieEntry) {
                // SUCESSO! Encontramos um filme/série da lista que talvez não estivesse carregado.
                // Vamos "hidratar" este objeto imediatamente com os dados do TMDB Search
                return {
                    ...localMovieEntry, // Mantém o videoUrl original e o ID interno
                    title: tmdbMovie.title || tmdbMovie.name,
                    imageUrl: tmdbMovie.poster_path ? `https://image.tmdb.org/t/p/w342${tmdbMovie.poster_path}` : localMovieEntry.imageUrl,
                    backdropUrl: tmdbMovie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${tmdbMovie.backdrop_path}` : undefined,
                    description: tmdbMovie.overview || "Sinopse indisponível.",
                    year: (tmdbMovie.release_date || tmdbMovie.first_air_date) ? parseInt((tmdbMovie.release_date || tmdbMovie.first_air_date).split('-')[0]) : 2024,
                    rating: tmdbMovie.vote_average ? tmdbMovie.vote_average.toFixed(1) : '0',
                    type: mediaType === 'tv' ? (localMovieEntry.type || 'series') : 'movie'
                } as Movie;
            }
            return null;
        });

        const resolvedApiMatches = await Promise.all(crossCheckPromises);
        apiMatches = resolvedApiMatches.filter((m): m is Movie => m !== null);

      } catch (error) {
        console.error("Erro na busca remota:", error);
      }

      // Combina resultados: Matches da API (Prioridade pois são mais exatos para a busca) + Matches Locais
      const combinedResults = [...apiMatches, ...localMatches];

      // Remove duplicatas por ID
      const uniqueResults = Array.from(new Map(combinedResults.map(item => [item.id, item])).values());

      setResults(uniqueResults);
      setIsSearching(false);
    }, 400); // Debounce de 400ms

    return () => clearTimeout(timeoutId);
  }, [searchQuery, movies]);

  const quickFilters = ['Ação', 'Comédia', '4K', 'Lançamentos', 'Terror', 'Animes', 'Desenhos'];

  return (
    <div className="min-h-screen bg-[#000807] pt-24 pb-20 px-4 md:px-8 animate-in fade-in duration-500">
      
      {/* --- COMMAND CENTER SEARCH BAR --- */}
      <div className="max-w-4xl mx-auto mb-10 sticky top-20 z-40">
        <div className="relative group">
           {/* Glow Effect */}
           <div className={`absolute -inset-0.5 bg-gradient-to-r from-brand via-purple-500 to-brand rounded-xl opacity-30 group-focus-within:opacity-100 blur transition duration-500 ${searchQuery ? 'opacity-70' : ''}`}></div>
           
           <div className="relative flex items-center bg-[#0a0a0a] rounded-xl border border-white/10 shadow-2xl">
              <div className="pl-5 text-gray-400 group-focus-within:text-brand transition-colors">
                {isSearching ? <Loader2 size={24} className="animate-spin" /> : <Search size={24} strokeWidth={2.5} />}
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Busque por filmes, séries ou animes..."
                autoFocus
                className="w-full bg-transparent text-white py-4 px-4 text-lg md:text-xl font-medium placeholder:text-gray-600 focus:outline-none"
              />
              {searchQuery && (
                <button 
                  onClick={() => onSearchChange('')}
                  className="pr-5 text-gray-500 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              )}
           </div>
        </div>

        {/* Quick Filters */}
        {!searchQuery && (
          <div 
            className={`flex flex-wrap gap-2 mt-4 justify-center transition-all duration-300 ease-in-out ${
                showFilters ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
            }`}
          >
            {quickFilters.map((tag) => (
              <button 
                key={tag}
                onClick={() => onSearchChange(tag)}
                className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-gray-400 text-xs font-medium hover:bg-brand/20 hover:text-brand hover:border-brand/30 transition-all active:scale-95"
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="max-w-[1400px] mx-auto">
        
        {/* State: Empty / Suggestions */}
        {!searchQuery && (
          <div className="mt-8 animate-in slide-in-from-bottom-4 duration-500">
             <div className="flex items-center gap-3 mb-6 px-2">
                <div className="p-2 bg-brand/10 rounded-lg text-brand">
                    <TrendingUp size={20} />
                </div>
                <h3 className="font-bold text-xl text-white">Recomendados para você</h3>
             </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
               {recommendedMovies.map(movie => (
                 <MovieCard key={movie.id} movie={movie} variant="grid" onClick={onMovieClick} />
               ))}
            </div>
          </div>
        )}

        {/* State: Results */}
        {searchQuery && (
          <div className="animate-in fade-in duration-300">
             <div className="mb-8 flex justify-between items-end border-b border-white/5 pb-4">
                <h3 className="text-2xl text-white font-bold">
                   Resultados
                </h3>
                <span className="text-sm text-gray-500 font-mono bg-white/5 px-2 py-1 rounded-md">
                   {results.length} encontrados
                </span>
             </div>
             
             {results.length > 0 ? (
               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-10">
                 {results.map(movie => (
                    <MovieCard key={movie.id} movie={movie} variant="grid" onClick={onMovieClick} />
                 ))}
               </div>
             ) : (
               !isSearching && (
                <div className="flex flex-col items-center justify-center py-24 text-center animate-in zoom-in-95 duration-300">
                    <div className="w-20 h-20 bg-[#0f1110] rounded-full flex items-center justify-center mb-6 border border-white/5 shadow-2xl relative">
                        <AlertCircle size={40} className="text-gray-600" />
                        <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">Título não encontrado</h3>
                    <p className="text-gray-400 max-w-md text-base leading-relaxed">
                        Não encontramos "<span className="text-white font-semibold">{searchQuery}</span>" na sua lista local.<br/>
                        <span className="text-xs text-gray-500 mt-2 block">Dica: Tente outro termo ou verifique se o ID está presente na lista.</span>
                    </p>
                    <button 
                        onClick={() => onSearchChange('')}
                        className="mt-8 px-8 py-3 bg-white text-black font-bold text-base rounded-xl hover:bg-gray-200 transition-colors"
                    >
                        Limpar Busca
                    </button>
                </div>
               )
             )}
          </div>
        )}
      </div>
    </div>
  );
};