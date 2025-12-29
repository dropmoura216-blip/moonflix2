import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, User, ChevronDown, LogOut, Film, Grid, ChevronRight, LogIn } from 'lucide-react';
import { ViewState } from '../types';
import { Logo } from './Logo';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState, options?: { initialTab?: 'movies' | 'series' | 'animes' | 'cartoons', initialGenre?: string }) => void;
  searchQuery?: string;
  onSearchChange?: (term: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentView, 
  onNavigate, 
  searchQuery = '', 
  onSearchChange 
}) => {
  const { user, signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Atualizado para incluir 'cartoons'
  const [activeMenu, setActiveMenu] = useState<'movies' | 'series' | 'animes' | 'cartoons' | 'profile' | null>(null);

  const navRef = useRef<HTMLElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuEnter = (menu: 'movies' | 'series' | 'animes' | 'cartoons' | 'profile') => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setActiveMenu(menu);
  };

  const handleMenuLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 150); 
  };

  const handleLinkClick = (view: ViewState, options?: { filterQuery?: string, initialTab?: 'movies' | 'series' | 'animes' | 'cartoons', initialGenre?: string }) => {
    if (options?.filterQuery && onSearchChange) {
        onSearchChange(options.filterQuery);
        onNavigate('search');
    } else {
        onNavigate(view, { initialTab: options?.initialTab, initialGenre: options?.initialGenre });
    }
    
    setActiveMenu(null);
    window.scrollTo(0, 0);
  };

  const handleAuthAction = () => {
    if (user) {
        handleLinkClick('profile');
    } else {
        onNavigate('auth');
    }
  };

  const movieGenres = ['Ação', 'Comédia', 'Drama', 'Ficção Científica', 'Terror', 'Romance', 'Animação', 'Documentário'];
  const seriesGenres = ['Dramas', 'Sitcoms', 'Suspense', 'Fantasia', 'Reality Shows', 'Animes'];
  const animeGenres = ['Shounen', 'Seinen', 'Romance', 'Fantasia', 'Ação', 'Drama'];
  const cartoonGenres = ['Ação', 'Aventura', 'Comédia', 'Família', 'Fantasia', 'Mistério'];

  return (
    <>
      <nav 
        ref={navRef}
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-in-out ${
          isScrolled || currentView === 'search' || activeMenu
            ? 'bg-[#000807]/95 backdrop-blur-xl shadow-lg border-b border-white/5 py-3' 
            : 'bg-gradient-to-b from-black/90 via-black/50 to-transparent py-5'
        }`}
      >
        <div className="w-full max-w-[2400px] mx-auto px-4 md:px-12 flex items-center justify-between">
          
          {/* --- LEFT: LOGO & NAV LINKS --- */}
          <div className="flex items-center gap-8 lg:gap-10 justify-center w-full md:justify-start md:w-auto">
            <div 
              className="cursor-pointer group relative z-50 transform hover:scale-105 transition-transform"
              onClick={() => handleLinkClick('home')}
            >
              <Logo size="md" />
            </div>

            <div className="hidden lg:flex items-center gap-1 text-sm font-medium text-gray-300 h-10">
              
              <button 
                onClick={() => handleLinkClick('home')}
                className={`px-4 h-full hover:text-white transition-colors flex items-center ${currentView === 'home' ? 'text-white font-bold' : ''}`}
              >
                Início
              </button>

              {/* Movies Menu */}
              <div 
                className="relative h-full"
                onMouseEnter={() => handleMenuEnter('movies')}
                onMouseLeave={handleMenuLeave}
              >
                <button 
                  className={`px-4 h-full flex items-center gap-1 hover:text-white transition-colors ${activeMenu === 'movies' ? 'text-white' : ''}`}
                  onClick={() => handleLinkClick('browse', { initialTab: 'movies' })}
                >
                  Filmes <ChevronDown size={12} className={`transition-transform duration-300 ${activeMenu === 'movies' ? 'rotate-180' : ''}`} />
                </button>
                
                <div className={`absolute top-full left-0 mt-0 w-[500px] bg-[#0f1110]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 origin-top-left grid grid-cols-2 ${activeMenu === 'movies' ? 'opacity-100 translate-y-2 visible' : 'opacity-0 translate-y-4 invisible pointer-events-none'}`}>
                   <div className="p-6 border-r border-white/5 bg-black/20">
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Gêneros Populares</h3>
                      <ul className="space-y-2">
                        {movieGenres.slice(0, 6).map(g => (
                            <li key={g}>
                                <button 
                                    onClick={() => handleLinkClick('browse', { initialTab: 'movies', initialGenre: g })} 
                                    className="text-gray-400 hover:text-brand transition-colors text-sm block text-left w-full hover:translate-x-1 duration-200"
                                >
                                    {g}
                                </button>
                            </li>
                        ))}
                      </ul>
                   </div>
                   <div className="p-6">
                      <div className="h-full flex flex-col justify-end items-start gap-4">
                         <div className="w-full h-32 rounded-lg bg-gradient-to-br from-brand/20 to-purple-900/20 border border-white/10 flex items-center justify-center overflow-hidden relative group cursor-pointer" onClick={() => handleLinkClick('browse', { initialTab: 'movies' })}>
                            <Film size={32} className="text-white relative z-10 group-hover:scale-110 transition-transform" />
                            <div className="absolute inset-0 bg-brand/10 group-hover:bg-brand/20 transition-colors"></div>
                         </div>
                         <button onClick={() => handleLinkClick('browse', { initialTab: 'movies' })} className="text-brand text-xs font-bold hover:underline flex items-center gap-1">Ver Todos <ChevronRight size={12}/></button>
                      </div>
                   </div>
                </div>
              </div>

              {/* Series Menu */}
              <div 
                className="relative h-full"
                onMouseEnter={() => handleMenuEnter('series')}
                onMouseLeave={handleMenuLeave}
              >
                <button 
                  className={`px-4 h-full flex items-center gap-1 hover:text-white transition-colors ${activeMenu === 'series' ? 'text-white' : ''}`}
                  onClick={() => handleLinkClick('browse', { initialTab: 'series' })}
                >
                  Séries <ChevronDown size={12} className={`transition-transform duration-300 ${activeMenu === 'series' ? 'rotate-180' : ''}`} />
                </button>

                 <div className={`absolute top-full left-0 mt-0 w-[400px] bg-[#0f1110]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 origin-top-left grid grid-cols-1 ${activeMenu === 'series' ? 'opacity-100 translate-y-2 visible' : 'opacity-0 translate-y-4 invisible pointer-events-none'}`}>
                   <div className="p-6">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Categorias</h3>
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            {seriesGenres.map(g => (
                                <button 
                                    key={g} 
                                    onClick={() => handleLinkClick('browse', { initialTab: 'series', initialGenre: g })} 
                                    className="text-gray-400 hover:text-white text-sm text-left"
                                >
                                    {g}
                                </button>
                            ))}
                        </div>
                   </div>
                </div>
              </div>

              {/* Animes Menu */}
              <div 
                className="relative h-full"
                onMouseEnter={() => handleMenuEnter('animes')}
                onMouseLeave={handleMenuLeave}
              >
                <button 
                  className={`px-4 h-full flex items-center gap-1 hover:text-white transition-colors ${activeMenu === 'animes' ? 'text-white' : ''}`}
                  onClick={() => handleLinkClick('browse', { initialTab: 'animes' })}
                >
                  Animes <ChevronDown size={12} className={`transition-transform duration-300 ${activeMenu === 'animes' ? 'rotate-180' : ''}`} />
                </button>

                 <div className={`absolute top-full left-0 mt-0 w-[400px] bg-[#0f1110]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 origin-top-left grid grid-cols-1 ${activeMenu === 'animes' ? 'opacity-100 translate-y-2 visible' : 'opacity-0 translate-y-4 invisible pointer-events-none'}`}>
                   <div className="p-6">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Gêneros de Anime</h3>
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            {animeGenres.map(g => (
                                <button 
                                    key={g} 
                                    onClick={() => handleLinkClick('browse', { initialTab: 'animes', initialGenre: g })} 
                                    className="text-gray-400 hover:text-white text-sm text-left"
                                >
                                    {g}
                                </button>
                            ))}
                        </div>
                   </div>
                </div>
              </div>

              {/* Cartoons Menu - Mega Menu Added */}
              <div 
                className="relative h-full"
                onMouseEnter={() => handleMenuEnter('cartoons')}
                onMouseLeave={handleMenuLeave}
              >
                <button 
                  className={`px-4 h-full flex items-center gap-1 hover:text-white transition-colors ${activeMenu === 'cartoons' ? 'text-white' : ''}`}
                  onClick={() => handleLinkClick('browse', { initialTab: 'cartoons' })}
                >
                  Desenhos <ChevronDown size={12} className={`transition-transform duration-300 ${activeMenu === 'cartoons' ? 'rotate-180' : ''}`} />
                </button>

                 <div className={`absolute top-full left-0 mt-0 w-[400px] bg-[#0f1110]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 origin-top-left grid grid-cols-1 ${activeMenu === 'cartoons' ? 'opacity-100 translate-y-2 visible' : 'opacity-0 translate-y-4 invisible pointer-events-none'}`}>
                   <div className="p-6">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Categorias</h3>
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            {cartoonGenres.map(g => (
                                <button 
                                    key={g} 
                                    onClick={() => handleLinkClick('browse', { initialTab: 'cartoons', initialGenre: g })} 
                                    className="text-gray-400 hover:text-white text-sm text-left"
                                >
                                    {g}
                                </button>
                            ))}
                        </div>
                   </div>
                </div>
              </div>

              <button 
                onClick={() => handleLinkClick('browse')}
                className={`px-4 h-full flex items-center gap-2 hover:text-brand transition-colors ${currentView === 'browse' ? 'text-brand font-bold' : ''}`}
              >
                <Grid size={16} /> Catálogo
              </button>

            </div>
          </div>

          {/* --- RIGHT: ACTIONS --- */}
          <div className="hidden md:flex items-center gap-3 md:gap-6">
            
            <button 
                onClick={() => {
                  onNavigate('search');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`p-2 rounded-full transition-all duration-300 hover:bg-white/10 ${currentView === 'search' ? 'text-brand bg-brand/10' : 'text-white hover:text-brand'}`}
                aria-label="Pesquisar"
            >
                <Search size={20} strokeWidth={2.5} />
            </button>

            <div className="flex items-center gap-5">
              <button className="text-gray-300 hover:text-white transition-colors relative">
                <Bell size={22} />
                {user && <span className="absolute top-0 right-0 block w-2 h-2 rounded-full bg-brand ring-2 ring-black transform translate-x-1/4 -translate-y-1/4"></span>}
              </button>

              {user ? (
                <div 
                    className="relative"
                    onMouseEnter={() => handleMenuEnter('profile')}
                    onMouseLeave={handleMenuLeave}
                >
                    <div className="flex items-center gap-2 cursor-pointer py-2">
                        <div className="w-9 h-9 rounded bg-brand flex items-center justify-center text-white font-bold text-sm shadow-lg border border-white/10 hover:border-white transition-colors">
                            {user.email?.charAt(0).toUpperCase()}
                        </div>
                        <ChevronDown size={12} className={`text-gray-300 transition-transform ${activeMenu === 'profile' ? 'rotate-180' : ''}`} />
                    </div>

                    <div 
                        className={`absolute right-0 top-full mt-2 w-56 bg-[#0f1110] border border-white/10 rounded-xl shadow-2xl py-2 transition-all duration-200 origin-top-right z-50 ${
                            activeMenu === 'profile' ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible pointer-events-none'
                        }`}
                    >
                        <div className="px-4 py-3 border-b border-white/5 mb-2">
                            <p className="text-xs text-gray-400">Logado como</p>
                            <p className="text-sm font-bold text-white truncate">{user.email}</p>
                        </div>
                        <button onClick={() => handleLinkClick('profile')} className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white flex items-center gap-3 transition-colors">
                            <User size={16} /> Minha Conta
                        </button>
                        <div className="h-px bg-white/5 my-2"></div>
                        <button onClick={() => { signOut(); setActiveMenu(null); handleLinkClick('home'); }} className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-3 transition-colors">
                            <LogOut size={16} /> Sair
                        </button>
                    </div>
                </div>
              ) : (
                <button 
                    onClick={handleAuthAction}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-medium transition-all"
                >
                    <LogIn size={16} /> Entrar
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};