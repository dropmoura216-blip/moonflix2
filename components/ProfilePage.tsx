import React, { useEffect, useState } from 'react';
import { Settings, HelpCircle, ChevronRight, User as UserIcon, LogOut, List, Shield, Smartphone, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserService } from '../services/userService';
import { TmdbService } from '../services/tmdb';
import { Movie } from '../types';
import { MovieCard } from './MovieCard';

interface ProfilePageProps {
  allMovies: Movie[];
  onMovieClick: (movie: Movie) => void;
  onSignOut: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ allMovies, onMovieClick, onSignOut }) => {
  const { user, signOut } = useAuth();
  
  // Separação de estados para evitar flickering
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [favoriteMovies, setFavoriteMovies] = useState<Movie[]>([]);
  const [loadingIds, setLoadingIds] = useState(true);
  const [isResolvingMovies, setIsResolvingMovies] = useState(true);

  const MenuItem = ({ icon, label, subLabel = '', onClick }: { icon: React.ReactNode, label: string, subLabel?: string, onClick?: () => void }) => (
    <button onClick={onClick} className="w-full flex items-center justify-between p-4 bg-secondary/30 hover:bg-secondary border border-white/5 rounded-xl transition-all group active:scale-[0.99] hover:border-white/10 h-full">
      <div className="flex items-center gap-4">
        <div className="text-gray-400 group-hover:text-brand transition-colors p-2 bg-black/20 rounded-lg">
          {icon}
        </div>
        <div className="text-left">
          <div className="text-white font-medium text-sm md:text-base">{label}</div>
          {subLabel && <div className="text-xs text-gray-500">{subLabel}</div>}
        </div>
      </div>
      <ChevronRight size={16} className="text-gray-600 opacity-50 group-hover:opacity-100 transition-opacity" />
    </button>
  );

  // 1. Buscar IDs (Apenas quando o usuário muda/monta componente)
  useEffect(() => {
    if (!user) return;
    let isMounted = true;
    
    setLoadingIds(true);
    UserService.getUserFavorites(user.id).then(ids => {
       if (isMounted) {
         setFavoriteIds(ids);
         setLoadingIds(false);
       }
    }).catch((e) => {
       console.error("Error fetching favorite IDs:", e);
       if (isMounted) setLoadingIds(false);
    });

    return () => { isMounted = false; };
  }, [user]);

  // 2. Resolver Filmes (Quando IDs ou allMovies mudam, mas sem resetar loading global agressivamente)
  useEffect(() => {
    if (loadingIds) return; 
    let isMounted = true;

    const resolveMovies = async () => {
        // Se não há favoritos, limpa e para de carregar
        if (favoriteIds.length === 0) {
            if (isMounted) {
                setFavoriteMovies([]);
                setIsResolvingMovies(false);
            }
            return;
        }

        try {
            const moviesPromises = favoriteIds.map(async (id) => {
                // 1. Tenta encontrar na lista em memória (allMovies)
                const found = allMovies.find(m => m.id.toString() === id);
                
                if (found) {
                    // Se achou, mas precisa enriquecer dados (ex: estava com placeholder 'Carregando...')
                    if (found.imdbId && (!found.description || found.title === 'Carregando...')) {
                         return await TmdbService.getMovieDetails(found.imdbId, found);
                    }
                    return found;
                }

                // 2. Não achou em memória? Busca do TMDB se for um ID IMDB (tt...)
                if (id.startsWith('tt')) {
                    const placeholder: Movie = {
                        id: id,
                        title: 'Carregando...',
                        imageUrl: '',
                        description: '',
                        genre: 'Filme',
                        year: new Date().getFullYear(),
                        imdbId: id
                    };
                    return await TmdbService.getMovieDetails(id, placeholder);
                }
                return null;
            });

            const resolved = await Promise.all(moviesPromises);
            
            if (isMounted) {
                setFavoriteMovies(resolved.filter((m): m is Movie => m !== null));
                setIsResolvingMovies(false);
            }
        } catch (e) {
            console.error("Error resolving movies:", e);
            if (isMounted) setIsResolvingMovies(false);
        }
    };

    resolveMovies();

    return () => { isMounted = false; };
  }, [favoriteIds, allMovies, loadingIds]);

  if (!user) return null;

  // Carregando apenas se estiver buscando IDs ou resolvendo filmes pela primeira vez (lista vazia)
  const isLoading = loadingIds || (isResolvingMovies && favoriteMovies.length === 0);

  const handleLogout = async () => {
    onSignOut(); // Navega imediatamente para Home para evitar "página feia" (blank screen)
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background pt-20 md:pt-32 pb-28 px-4 md:px-12 animate-in slide-in-from-right-4 duration-300">
      
      <div className="max-w-[1600px] mx-auto">
        
        <h1 className="text-3xl font-bold text-white mb-8 hidden md:block border-b border-white/5 pb-4">Minha Conta</h1>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
            
            <div className="w-full lg:w-[320px] flex-shrink-0">
                <div className="bg-[#0f1110] border border-white/5 rounded-2xl p-6 flex flex-col items-center sticky top-28 shadow-2xl">
                    <div className="relative w-28 h-28 md:w-32 md:h-32 mb-4 group cursor-pointer">
                        <div className={`w-full h-full rounded-full p-[3px] transition-transform group-hover:scale-105 bg-gradient-to-tr from-brand to-purple-900`}>
                          <div className="w-full h-full rounded-full bg-[#0a0a0a] flex items-center justify-center border-4 border-background overflow-hidden">
                              <span className="text-4xl font-bold text-white">
                                {user.email?.charAt(0).toUpperCase()}
                              </span>
                          </div>
                        </div>
                        <div className={`absolute bottom-1 right-1 border border-white/10 p-2 rounded-full transition-colors shadow-lg bg-secondary text-brand`}>
                           <Settings size={16} />
                        </div>
                    </div>
                    
                    <h2 className="text-xl font-bold text-white mb-1 truncate w-full text-center">{user.email}</h2>
                    <p className="text-gray-500 text-sm mb-6 flex items-center gap-1 justify-center">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span> Online agora
                    </p>
                    
                    <div className={`w-full rounded-xl p-4 border border-white/5 mb-6 bg-secondary/30`}>
                        <div className="flex justify-between items-center text-sm mb-3">
                            <span className="text-gray-400">Status</span>
                            <span className="text-gray-300 font-bold bg-white/10 px-2 py-0.5 rounded text-xs border border-white/10">MEMBRO</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">Desde</span>
                            <span className="text-white text-xs">{new Date(user.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 text-red-400 hover:text-white hover:bg-red-500 rounded-lg transition-all border border-red-500/20 hover:border-red-500 group"
                    >
                        <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">Sair da conta</span>
                    </button>
                </div>
            </div>

            <div className="flex-1">
                
                {/* Favorites Section */}
                <div className="mb-12">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <List size={20} className="text-brand" /> Minha Lista de Favoritos
                    </h3>
                    
                    {isLoading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="animate-spin text-brand" size={32} />
                        </div>
                    ) : favoriteMovies.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-in fade-in duration-500">
                            {favoriteMovies.map(movie => (
                                <MovieCard key={movie.id} movie={movie} variant="grid" onClick={onMovieClick} />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-secondary/20 rounded-xl p-8 text-center border border-white/5 animate-in fade-in">
                            <p className="text-gray-400 mb-4">Você ainda não adicionou nenhum filme aos favoritos.</p>
                            <button className="text-brand text-sm font-bold hover:underline">Explorar Catálogo</button>
                        </div>
                    )}
                </div>

                <div className="space-y-8">
                    <div>
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2 ml-1">
                            <Settings size={14} /> Preferências & Conta
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                             <MenuItem 
                                icon={<Smartphone size={20} />} 
                                label="Ajustes do App" 
                                subLabel="Qualidade de vídeo e dados"
                            />
                            <MenuItem 
                                icon={<UserIcon size={20} />} 
                                label="Dados da Conta" 
                                subLabel="Email, senha e segurança"
                            />
                            <MenuItem 
                                icon={<Shield size={20} />} 
                                label="Privacidade" 
                                subLabel="Controle de dados e cookies"
                            />
                        </div>
                    </div>

                    <div>
                         <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2 ml-1">
                            <HelpCircle size={14} /> Suporte
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                            <MenuItem 
                                icon={<HelpCircle size={20} />} 
                                label="Central de Ajuda" 
                                subLabel="Perguntas frequentes"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-12 border-t border-white/5 pt-8 text-center md:text-left">
                    <div className="text-[10px] text-gray-600">
                       ID do Usuário: {user.id}<br/>
                       Versão 2.2.0 (Free Tier)
                    </div>
                </div>

            </div>
        </div>

      </div>
    </div>
  );
};