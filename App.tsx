import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { Hero } from './components/Hero';
import { MovieRow } from './components/MovieRow';
import { Footer } from './components/Footer';
import { MovieDetails } from './components/MovieDetails';
import { SearchPage } from './components/SearchPage';
import { ProfilePage } from './components/ProfilePage';
import { BrowsePage } from './components/BrowsePage';
import { LoadingScreen } from './components/LoadingScreen';
import { InstallPrompt } from './components/InstallPrompt';
import { AuthPage } from './components/AuthPage';
import { 
  BenefitsBar, 
  FeaturedCollections, 
  TrendingSpotlight, 
  ContentWithSidebar,
  ImmersiveBreak,
  WideMovieRow,
  NewsletterSection
} from './components/HomeWidgets';
import { RAW_PARSED_MOVIES, EMPTY_HERO_MOVIE } from './constants';
import { RAW_PARSED_SERIES } from './constants_series'; 
import { RAW_PARSED_ANIMES } from './constants_animes'; 
import { RAW_PARSED_CARTOONS } from './constants_cartoons';
import { TmdbService } from './services/tmdb';
import { Movie, ViewState, Category } from './types';

// --- UTIL: Image Preloader Otimizado ---
const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve) => {
    if (!src || src.includes('unsplash')) {
      resolve();
      return;
    }
    const img = new Image();
    img.src = src;
    img.onload = () => resolve();
    img.onerror = () => resolve();
  });
};

const MainApp: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  
  // --- STATE OTIMIZADO ---
  // globalCatalogRef: Armazena TODOS os dados sem causar re-render quando atualizado.
  // Isso é crucial para performance com listas grandes (+50k itens).
  const globalCatalogRef = useRef<Movie[]>(RAW_PARSED_MOVIES);
  
  // displayCatalog: Estado usado apenas para passar dados para componentes que precisam reagir a mudanças (como Browse)
  const [displayCatalog, setDisplayCatalog] = useState<Movie[]>(RAW_PARSED_MOVIES);
  
  // Dados específicos da Home (mantidos pequenos para renderização rápida)
  const [featuredHero, setFeaturedHero] = useState<Movie>(EMPTY_HERO_MOVIE);
  const [homeLists, setHomeLists] = useState<{
    releases: Movie[];
    top10: Movie[];
    continueWatching: Movie[];
    trending: Movie[];
  }>({ releases: [], top10: [], continueWatching: [], trending: [] });

  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAppLoading, setIsAppLoading] = useState(true);
  
  const [initialBrowseTab, setInitialBrowseTab] = useState<'movies' | 'series' | 'animes' | 'cartoons'>('movies');
  const [initialBrowseGenre, setInitialBrowseGenre] = useState<string>('all');

  // Redirecionamento de segurança
  useEffect(() => {
    if (!user && !authLoading && currentView === 'profile') {
        setCurrentView('home');
    }
  }, [user, authLoading, currentView]);

  // --- FASE 1: INICIALIZAÇÃO LEVE (Apenas Filmes) ---
  useEffect(() => {
    const initFast = async () => {
      try {
        // 1. Pega apenas filmes iniciais para a Home
        const movies = RAW_PARSED_MOVIES;
        
        // Identifica itens prioritários (Hero, Top 10, Lançamentos e Trending)
        const rawHero = movies.find(m => m.id === 5) || movies[0];
        const rawTop10 = movies.slice(0, 10);
        const rawReleases = movies.slice(0, 20); // Aumentado para 20
        const rawTrending = movies.slice(25, 45); // Definido explicitamente e aumentado para 20 itens

        // IDs para enriquecer com TMDB imediatamente (Incluindo Trending agora!)
        const priorityIds = new Set([
          rawHero.id, 
          ...rawTop10.map(m => m.id), 
          ...rawReleases.map(m => m.id),
          ...rawTrending.map(m => m.id)
        ]);
        const priorityBatch = movies.filter(m => priorityIds.has(m.id));

        // Busca dados enriquecidos (paralelo limitado pelo TmdbService)
        // TmdbService já trata erros internamente, mas garantimos aqui
        const enrichedPriority = await Promise.all(
          priorityBatch.map(async (movie) => {
            if (movie.imdbId) {
               return await TmdbService.getMovieDetails(movie.imdbId, movie).catch(() => movie);
            }
            return movie;
          })
        );

        // Atualiza o catálogo global com os dados enriquecidos
        enrichedPriority.forEach(enriched => {
          const idx = globalCatalogRef.current.findIndex(m => m.id === enriched.id);
          if (idx !== -1) globalCatalogRef.current[idx] = enriched;
        });

        // Configura dados da Home
        const finalHero = enrichedPriority.find(m => m.id === rawHero.id) || rawHero;
        
        // Preload da imagem do Hero para evitar layout shift
        if (finalHero.backdropUrl || finalHero.imageUrl) {
           await preloadImage(finalHero.backdropUrl || finalHero.imageUrl).catch(() => {});
        }

        setFeaturedHero(finalHero);
        setHomeLists({
          releases: enrichedPriority.filter(m => rawReleases.some(r => r.id === m.id)),
          top10: enrichedPriority.filter(m => rawTop10.some(r => r.id === m.id)),
          continueWatching: movies.slice(15, 22),
          // Agora usa os dados enriquecidos para Trending também
          trending: enrichedPriority.filter(m => rawTrending.some(r => r.id === m.id))
        });

        // Libera a UI imediatamente
        setIsAppLoading(false);
        setDisplayCatalog([...globalCatalogRef.current]); // Atualiza view inicial

        // --- FASE 2: CARREGAMENTO PROGRESSIVO EM SEGUNDO PLANO ---
        // Carrega Séries, Animes e Desenhos sem bloquear a thread principal
        setTimeout(() => {
           // 1. Carrega Séries
           const series = RAW_PARSED_SERIES;
           globalCatalogRef.current = [...globalCatalogRef.current, ...series];
           
           // 2. Carrega Animes e Desenhos (pequeno delay para não travar scroll)
           setTimeout(() => {
              const others = [...RAW_PARSED_ANIMES, ...RAW_PARSED_CARTOONS];
              globalCatalogRef.current = [...globalCatalogRef.current, ...others];
              
              // Atualiza o estado visível apenas uma vez no final para evitar re-renderizações
              setDisplayCatalog([...globalCatalogRef.current]);
           }, 500);

        }, 1000);
      } catch (e) {
        console.error("Critical Init Error:", e);
        // Em caso de erro crítico, libera a UI para não travar no loading
        setIsAppLoading(false);
      }
    };

    initFast();
  }, []);

  // Categorias estáticas para evitar recálculo pesado
  const secondaryCategories = useMemo(() => {
    // Nota: Usamos apenas os filmes já carregados na memória para estas categorias
    const source = displayCatalog.length > 0 ? displayCatalog : RAW_PARSED_MOVIES;
    // Aumentado a amostragem para encontrar mais filmes de gêneros específicos (era 2000)
    const sample = source.slice(0, 15000); 

    const getByGenre = (genreList: string[]) => {
      return sample.filter(m => {
        const movieGenres = (m.genres || [m.genre || '']).map(g => g.toLowerCase());
        return genreList.some(g => movieGenres.some(mg => mg.includes(g.toLowerCase())));
      }).slice(0, 25); // Aumentado limite para 25 itens por linha (era 15)
    };
    
    return [
      { id: 'action', title: 'Adrenalina e Aventura', movies: getByGenre(['Ação', 'Action', 'Aventura']) },
      { id: 'comedy', title: 'Para Morrer de Rir', movies: getByGenre(['Comédia', 'Comedy']) },
      { id: 'scifi', title: 'Ficção e Fantasia', movies: getByGenre(['Ficção', 'Fantasia', 'Fantasy', 'Science Fiction']) },
      { id: 'horror', title: 'Terror e Suspense', movies: getByGenre(['Terror', 'Horror', 'Mistério']) },
      { id: 'animation', title: 'Animações', movies: getByGenre(['Animação', 'Animation', 'Anime']) },
    ].filter(cat => cat.movies.length > 0);
  }, [displayCatalog.length]); // Dependência apenas no tamanho do catálogo

  const handleMovieClick = useCallback((movie: Movie) => setSelectedMovie(movie), []);
  const handleBack = useCallback(() => setSelectedMovie(null), []);
  
  const handleNavigate = useCallback((view: ViewState, options?: { initialTab?: 'movies' | 'series' | 'animes' | 'cartoons', initialGenre?: string }) => {
    if (view === 'profile' && !user) {
        setCurrentView('auth');
        return;
    }
    setSelectedMovie(null);
    if (options?.initialTab) setInitialBrowseTab(options.initialTab);
    if (options?.initialGenre) setInitialBrowseGenre(options.initialGenre);
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [user]);

  const handleSearchChange = useCallback((term: string) => {
    setSearchQuery(term);
    if (term.length > 0) {
      setCurrentView('search'); // Atualiza direto sem checar currentView para garantir fluidez
    }
  }, []);

  if (authLoading || (isAppLoading && currentView !== 'auth')) {
      return <LoadingScreen />;
  }

  const renderContent = () => {
    if (currentView === 'auth' && !user) {
        return <AuthPage onSuccess={() => setCurrentView('home')} onClose={() => setCurrentView('home')} />;
    }

    if (selectedMovie) {
      // Passamos globalCatalogRef.current para detalhes para garantir acesso a tudo, mas sem recriar props
      return (
        <MovieDetails 
          movie={selectedMovie} 
          allMovies={globalCatalogRef.current} 
          onBack={handleBack} 
          onMovieClick={handleMovieClick}
        />
      );
    }

    switch (currentView) {
      case 'search':
        // SearchPage recebe o catálogo completo
        return <SearchPage movies={globalCatalogRef.current} onMovieClick={handleMovieClick} searchQuery={searchQuery} onSearchChange={handleSearchChange} />;
      case 'browse':
        return (
            <BrowsePage 
                allMovies={globalCatalogRef.current} 
                onMovieClick={handleMovieClick} 
                initialTab={initialBrowseTab} 
                initialGenre={initialBrowseGenre} 
            />
        );
      case 'profile':
        return (
          <ProfilePage 
            allMovies={globalCatalogRef.current} 
            onMovieClick={handleMovieClick} 
            onSignOut={() => handleNavigate('home')} 
          />
        );
      case 'home':
      default:
        return (
          <>
            <Hero movie={featuredHero} onPlayClick={handleMovieClick} />
            <div className="relative z-10 bg-background pb-8 space-y-10 md:space-y-12">
              <BenefitsBar />
              
              {/* Lançamentos */}
              <div className="-mt-8 md:-mt-10 relative z-20">
                 <MovieRow category={{ id: 'releases', title: 'Lançamentos', movies: homeLists.releases }} onMovieClick={handleMovieClick} />
              </div>
              
              <TrendingSpotlight movies={homeLists.top10} onMovieClick={handleMovieClick} />
              <FeaturedCollections />
              
              {homeLists.trending.length > 0 && (
                <WideMovieRow 
                  title="Em Alta na MoonFlix" 
                  movies={homeLists.trending} 
                  onMovieClick={handleMovieClick} 
                />
              )}

              {/* Categorias Secundárias - Renderização Otimizada */}
              {secondaryCategories.map((cat, index) => (
                  <React.Fragment key={cat.id}>
                      <MovieRow category={cat} onMovieClick={handleMovieClick} />
                      {index === 1 && <ImmersiveBreak onMovieClick={handleMovieClick} />}
                      {index === 2 && <ContentWithSidebar movies={homeLists.continueWatching} onMovieClick={handleMovieClick} />}
                  </React.Fragment>
              ))}
              
              <NewsletterSection />
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background text-text font-sans antialiased selection:bg-brand/30 selection:text-white pb-20 md:pb-0">
      
      {/* Top Navbar (Visível no Desktop, Simplificado no Mobile) */}
      {currentView !== 'auth' && (
        <Navbar currentView={currentView} onNavigate={handleNavigate} searchQuery={searchQuery} onSearchChange={handleSearchChange} />
      )}

      {/* Bottom Navigation (Mobile Only) */}
      {currentView !== 'auth' && (
        <BottomNav currentView={currentView} onNavigate={(view) => handleNavigate(view)} />
      )}
      
      <InstallPrompt />

      <main className="animate-in fade-in duration-700">
        {renderContent()}
      </main>

      {!isAppLoading && currentView !== 'auth' && !selectedMovie && <Footer />}
    </div>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <MainApp />
  </AuthProvider>
);

export default App;