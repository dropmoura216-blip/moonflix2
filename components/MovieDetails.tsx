import React, { useEffect, useState } from 'react';
import { ArrowLeft, Plus, ThumbsUp, Share2, Monitor, Volume2, CheckCircle2, Calendar, Clapperboard, Loader2 } from 'lucide-react';
import { Movie } from '../types';
import { VideoPlayer } from './VideoPlayer';
import { Button } from './Button';
import { MovieRow } from './MovieRow';
import { UserService } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';

interface MovieDetailsProps {
  movie: Movie;
  allMovies: Movie[]; 
  onBack: () => void;
  onMovieClick: (movie: Movie) => void;
}

export const MovieDetails: React.FC<MovieDetailsProps> = ({ movie, allMovies, onBack, onMovieClick }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'cast'>('overview');
  
  // Estados de Interação
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoadingInteractions, setIsLoadingInteractions] = useState(true);
  
  // Estado para recomendações
  const [relatedMovies, setRelatedMovies] = useState<Movie[]>([]);

  // 1. Efeito de Navegação e Reset Visual (Apenas quando o ID do filme muda)
  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveTab('overview');
    setRelatedMovies([]); // Limpa recomendações antigas visualmente
  }, [movie.id]);

  // 2. Carregar Interações do Usuário (Quando User ou Filme mudam)
  useEffect(() => {
    setIsFavorite(false);
    setIsLiked(false);
    setIsLoadingInteractions(true);

    if (user && movie.id) {
        const fetchInteractions = async () => {
            try {
                const [fav, like] = await Promise.all([
                    UserService.isFavorite(user.id, movie.id.toString()),
                    UserService.hasLiked(user.id, movie.id.toString())
                ]);
                setIsFavorite(fav);
                setIsLiked(like);
            } catch (e) {
                console.error("Failed to load user interactions", e);
            } finally {
                setIsLoadingInteractions(false);
            }
        };
        fetchInteractions();
    } else {
        setIsLoadingInteractions(false);
    }
  }, [movie.id, user]);

  // 3. Calcular Recomendações (Pode rodar várias vezes sem afetar o scroll)
  useEffect(() => {
    const calculateRecommendations = async () => {
        // Pequeno delay para garantir performance da UI
        await new Promise(resolve => setTimeout(resolve, 50));

        if (!allMovies || allMovies.length === 0) return;

        const currentGenres = movie.genres || (movie.genre ? [movie.genre] : []);
        
        // Filtra candidatos baseados no gênero
        const candidates = allMovies.filter(m => {
            if (m.id === movie.id) return false;
            // Evita processar filmes "quebrados" ou placeholders sem imagem
            if (m.title === 'Carregando...' || m.imageUrl?.includes('unsplash')) return false;

            const mGenres = m.genres || (m.genre ? [m.genre] : []);
            return mGenres.some(g => currentGenres.includes(g));
        });

        // Algoritmo Fisher-Yates Shuffle
        const shuffled = [...candidates];
        let m = shuffled.length, t, i;
        
        while (m) {
            i = Math.floor(Math.random() * m--);
            t = shuffled[m];
            shuffled[m] = shuffled[i];
            shuffled[i] = t;
        }

        // Seleciona os top 12
        let finalSelection = shuffled.slice(0, 12);

        // Fallback: Se não tiver recomendações suficientes, pega aleatórios
        if (finalSelection.length < 5) {
            const others = allMovies
                .filter(m => m.id !== movie.id && !finalSelection.includes(m) && m.title !== 'Carregando...')
                .slice(0, 20);
            
            for (let j = others.length - 1; j > 0; j--) {
                const k = Math.floor(Math.random() * (j + 1));
                [others[j], others[k]] = [others[k], others[j]];
            }
            
            finalSelection = [...finalSelection, ...others.slice(0, 10 - finalSelection.length)];
        }

        setRelatedMovies(finalSelection);
    };

    calculateRecommendations();

  }, [movie.id, allMovies]); // allMovies está aqui, mas este efeito NÃO reseta o scroll

  const handleToggleFavorite = async () => {
    if (!user) {
        alert("Faça login ou crie uma conta para salvar seus filmes favoritos!");
        return;
    }

    if (isLoadingInteractions) return;

    // OPTIMISTIC UPDATE
    const previousState = isFavorite;
    setIsFavorite(!previousState);

    try {
        if (previousState) {
            await UserService.removeFromFavorites(user.id, movie.id.toString());
        } else {
            await UserService.addToFavorites(user.id, movie.id.toString());
        }
    } catch (e: any) {
        setIsFavorite(previousState);
        console.error("Error toggling favorite:", e);
    }
  };

  const handleToggleLike = async () => {
    if (!user) {
        alert("Faça login para curtir!");
        return;
    }

    if (isLoadingInteractions) return;

    const previousState = isLiked;
    setIsLiked(!previousState);

    try {
        await UserService.toggleLike(user.id, movie.id.toString());
    } catch (e: any) {
        setIsLiked(previousState);
        console.error("Error toggling like:", e);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] animate-in fade-in duration-500 text-gray-100">
      
      {/* Background Fixo (Parallax feel) */}
      <div className="fixed top-0 left-0 right-0 h-[100vh] w-full overflow-hidden -z-10 pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] right-[-10%] h-[70%] opacity-20 blur-[100px] saturate-200">
            <img src={movie.backdropUrl || movie.imageUrl} className="w-full h-full object-cover" alt="" />
         </div>
         <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/60 via-[#050505]/90 to-[#050505]"></div>
      </div>

      <div className="container mx-auto px-4 md:px-8 lg:px-12 pt-24 md:pt-28 pb-20">
        
        <div className="flex items-center justify-between mb-8">
            <button 
            onClick={onBack}
            className="group flex items-center gap-3 text-gray-400 hover:text-white transition-all px-4 py-2 rounded-full hover:bg-white/5 border border-transparent hover:border-white/10"
            >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold text-sm">Voltar ao Catálogo</span>
            </button>
            
            <div className="hidden md:flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-widest">
                <span>{(movie.type === 'series') ? 'Séries' : 'Filmes'}</span>
                <span className="text-gray-700">/</span>
                <span className="text-brand">{movie.genre}</span>
            </div>
        </div>

        <div className="max-w-[1200px] mx-auto">
            
            <div className="relative mb-12">
                <VideoPlayer 
                  src={movie.videoUrl || ""} 
                  poster={movie.imageUrl} 
                  backdrop={movie.backdropUrl}
                  title={movie.title}
                />
            </div>

            <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
                
                <div className="flex-1">
                    
                    <div className="mb-6">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 leading-[1.1] tracking-tight">
                            {movie.title}
                        </h1>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-400">
                            <div className="flex items-center gap-1.5 text-black font-bold bg-[#E5B546] px-2 py-0.5 rounded shadow-[0_0_15px_rgba(229,181,70,0.3)]">
                                <span className="text-xs">IMDb</span>
                                <span>{movie.rating}</span>
                            </div>
                            
                            <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                            <span>{movie.year}</span>
                            <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                            <span>{movie.duration}</span>
                            
                            <div className="flex items-center gap-2 ml-2">
                               <span className="border border-white/20 px-1.5 py-0.5 rounded text-[10px] font-bold text-gray-300">4K UHD</span>
                               <span className="border border-white/20 px-1.5 py-0.5 rounded text-[10px] font-bold text-gray-300">HDR10</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 mb-10 border-b border-white/5 pb-10">
                        <Button 
                            variant="primary" 
                            onClick={handleToggleFavorite}
                            disabled={isLoadingInteractions}
                            className={`flex-1 md:flex-none min-w-[160px] border-none shadow-xl transition-all duration-300 transform active:scale-95 ${
                                isFavorite 
                                    ? 'bg-green-600 hover:bg-green-700 text-white ring-2 ring-green-400/30' 
                                    : 'bg-brand hover:bg-brand/90 text-white shadow-brand/20'
                            } ${isLoadingInteractions ? 'opacity-80 cursor-wait' : ''}`}
                        >
                            <div className={`transition-all duration-300 ${isFavorite && !isLoadingInteractions ? 'scale-110' : 'scale-100'}`}>
                                {isLoadingInteractions ? (
                                    <Loader2 size={20} className="animate-spin" />
                                ) : (
                                    isFavorite ? <CheckCircle2 size={20} /> : <Plus size={20} />
                                )}
                            </div>
                            {isLoadingInteractions ? 'Carregando...' : (isFavorite ? 'Na sua Lista' : 'Minha Lista')}
                        </Button>
                        
                        <Button variant="secondary" className="flex-1 md:flex-none border-white/10 hover:bg-white/10 hover:border-white/30">
                            <Share2 size={20} /> Compartilhar
                        </Button>
                        
                        <Button 
                            variant="secondary" 
                            onClick={handleToggleLike}
                            disabled={isLoadingInteractions}
                            className={`w-12 px-0 flex items-center justify-center border-white/10 hover:bg-white/10 hover:border-white/30 transition-all duration-300 ${
                                isLiked ? 'text-brand border-brand/50 bg-brand/10' : 'hover:text-green-400'
                            }`}
                        >
                            {isLoadingInteractions ? (
                                <Loader2 size={16} className="animate-spin text-gray-500" />
                            ) : (
                                <ThumbsUp 
                                    size={20} 
                                    className={`transition-transform duration-300 ${isLiked ? 'fill-current scale-125' : 'scale-100'}`} 
                                />
                            )}
                        </Button>
                    </div>

                    <div className="mb-8">
                         <div className="flex items-center gap-8 border-b border-white/10 mb-6">
                            <button 
                                onClick={() => setActiveTab('overview')}
                                className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all border-b-2 ${
                                    activeTab === 'overview' ? 'text-white border-brand' : 'text-gray-500 border-transparent hover:text-gray-300'
                                }`}
                            >
                                Visão Geral
                            </button>
                            <button 
                                onClick={() => setActiveTab('cast')}
                                className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all border-b-2 ${
                                    activeTab === 'cast' ? 'text-white border-brand' : 'text-gray-500 border-transparent hover:text-gray-300'
                                }`}
                            >
                                Elenco & Equipe
                            </button>
                        </div>

                        <div className="min-h-[150px] animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {activeTab === 'overview' && (
                                <div>
                                    <p className="text-gray-300 text-lg leading-relaxed font-light mb-8 max-w-2xl">
                                        {movie.description}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {(movie.genres || [movie.genre]).map((g, i) => (
                                            <span key={i} className="px-3 py-1 bg-white/5 border border-white/5 rounded-full text-xs text-gray-300 hover:text-white hover:border-white/20 transition-colors cursor-default">
                                                {g}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'cast' && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {movie.cast && movie.cast.length > 0 ? movie.cast.map((actor, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-xs font-bold text-gray-400 border border-white/10">
                                                {actor.charAt(0)}
                                            </div>
                                            <span className="text-sm font-medium text-gray-200">{actor}</span>
                                        </div>
                                    )) : (
                                        <p className="text-gray-500 italic col-span-3">Informações de elenco indisponíveis no momento.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                <div className="w-full lg:w-[300px] flex-shrink-0">
                    <div className="bg-[#0f1110]/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sticky top-28">
                        <h3 className="text-white font-bold text-xs uppercase tracking-widest mb-6 flex items-center gap-2 text-gray-500">
                            Ficha Técnica
                        </h3>
                        
                        <div className="space-y-5">
                            <div className="flex items-center justify-between pb-4 border-b border-white/5">
                                <div className="flex items-center gap-3 text-gray-400">
                                    <Monitor size={18} />
                                    <span className="text-sm font-medium">Qualidade</span>
                                </div>
                                <span className="text-xs font-bold bg-white/10 border border-white/10 px-2 py-1 rounded text-white">4K ULTRA HD</span>
                            </div>
                             <div className="flex items-center justify-between pb-4 border-b border-white/5">
                                <div className="flex items-center gap-3 text-gray-400">
                                    <Volume2 size={18} />
                                    <span className="text-sm font-medium">Áudio</span>
                                </div>
                                <span className="text-xs font-bold bg-white/10 border border-white/10 px-2 py-1 rounded text-white">5.1 / ATMOS</span>
                            </div>
                            <div className="flex items-center justify-between pb-4 border-b border-white/5">
                                <div className="flex items-center gap-3 text-gray-400">
                                    <Calendar size={18} />
                                    <span className="text-sm font-medium">Lançamento</span>
                                </div>
                                <span className="text-sm text-white">{movie.fullReleaseDate || movie.year}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 text-gray-400">
                                    <CheckCircle2 size={18} />
                                    <span className="text-sm font-medium">Status</span>
                                </div>
                                <span className="text-xs font-bold text-brand bg-brand/10 px-2 py-1 rounded border border-brand/20">Disponível</span>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/5">
                            <p className="text-[10px] text-gray-500 leading-relaxed text-center">
                                © 2024 MoonFlix Inc. Todos os direitos reservados. Classificação indicativa verificada.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>

        {/* Recomendações: Só renderiza se tiver itens, para evitar layout shift */}
        {relatedMovies.length > 0 && (
            <div className="mt-24 pt-10 border-t border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center gap-3 mb-8 px-4">
                    <div className="p-2 bg-brand/10 rounded-lg text-brand">
                        <Clapperboard size={20} />
                    </div>
                    <h3 className="text-2xl font-bold text-white tracking-tight">Recomendados para você</h3>
                </div>
                <MovieRow 
                    category={{ id: 'related', title: '', movies: relatedMovies }} 
                    onMovieClick={onMovieClick} 
                />
            </div>
        )}

      </div>
    </div>
  );
};