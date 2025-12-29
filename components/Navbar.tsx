import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, User, ChevronDown, Menu, X, LogOut, Settings, Film, Grid, ChevronRight, Home, LayoutList, LogIn, Tv, Smile, ChevronLeft } from 'lucide-react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Atualizado para incluir 'cartoons'
  const [activeMenu, setActiveMenu] = useState<'movies' | 'series' | 'animes' | 'cartoons' | 'profile' | null>(null);
  const [mobileSubMenu, setMobileSubMenu] = useState<'main' | 'movies' | 'series' | 'animes' | 'cartoons'>('main');

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

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (!isMobileMenuOpen) {
        setTimeout(() => setMobileSubMenu('main'), 300);
    }
  }, [isMobileMenuOpen]);

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
    
    setIsMobileMenuOpen(false);
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
          <div className="flex items-center gap-8 lg:gap-10">
            <div 
              className="cursor-pointer group relative z-50"
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
          <div className="flex items-center gap-3 md:gap-6">
            
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

            <div className="hidden md:flex items-center gap-5">
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

            {/* Mobile Toggle */}
            <button 
              className="md:hidden text-white p-2 hover:bg-white/10 rounded-full transition-colors relative z-50"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? (
                 <div className="opacity-0"><Menu size={24} /></div>
              ) : (
                 <Menu size={24} />
              )}
            </button>

          </div>
        </div>
      </nav>

      {/* --- MEGA MOBILE DRAWER --- */}
      <div 
        className={`fixed inset-0 z-[100] md:hidden transition-all duration-300 ease-out ${
          isMobileMenuOpen ? 'visible' : 'invisible pointer-events-none'
        }`}
      >
        <div 
          className={`absolute inset-0 bg-black/80 transition-opacity duration-300 ${
            isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        <div 
          className={`absolute top-0 right-0 h-full w-[85%] max-w-[340px] bg-[#0a0a0a] border-l border-white/5 shadow-2xl transform transition-transform duration-300 cubic-bezier(0.16, 1, 0.3, 1) flex flex-col overflow-hidden ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between px-5 pt-6 pb-4 bg-[#0a0a0a] z-20">
             <div className="opacity-80">
                <Logo size="sm" />
             </div>
             <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 relative overflow-hidden">
              
              <div 
                className={`absolute inset-0 flex flex-col overflow-y-auto px-5 transition-transform duration-300 ${
                  mobileSubMenu === 'main' ? 'translate-x-0' : '-translate-x-full'
                }`}
              >
                  {user ? (
                    <div className="mb-6" onClick={() => handleLinkClick('profile')}>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 active:bg-white/10 transition-colors cursor-pointer">
                        <div className="w-10 h-10 rounded-full bg-brand flex items-center justify-center text-white font-bold text-sm shadow-md">
                            {user.email?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white font-medium text-sm truncate">{user.email}</p>
                            <p className="text-brand text-xs font-bold uppercase tracking-wide">Membro</p>
                        </div>
                        <ChevronRight size={16} className="text-gray-600" />
                        </div>
                    </div>
                  ) : (
                    <button 
                        onClick={handleAuthAction}
                        className="w-full flex items-center justify-center gap-2 py-3 mb-6 bg-brand text-white rounded-xl font-bold hover:bg-brand/90"
                    >
                        <LogIn size={20} /> Fazer Login
                    </button>
                  )}

                  <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3 pl-2">Navegação</p>
                  
                  <div className="space-y-2">
                    <MobileLink 
                        icon={<Home size={18} />} 
                        label="Início" 
                        active={currentView === 'home'} 
                        onClick={() => handleLinkClick('home')} 
                    />
                    
                    <button 
                        onClick={() => setMobileSubMenu('movies')}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors group"
                    >
                        <div className="flex items-center gap-4">
                            <Film size={18} className="text-gray-500 group-hover:text-brand transition-colors" />
                            Filmes
                        </div>
                        <ChevronRight size={16} className="text-gray-600" />
                    </button>

                    <button 
                        onClick={() => setMobileSubMenu('series')}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors group"
                    >
                        <div className="flex items-center gap-4">
                            <LayoutList size={18} className="text-gray-500 group-hover:text-brand transition-colors" />
                            Séries
                        </div>
                        <ChevronRight size={16} className="text-gray-600" />
                    </button>

                    <button 
                        onClick={() => setMobileSubMenu('animes')}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors group"
                    >
                        <div className="flex items-center gap-4">
                            <Tv size={18} className="text-gray-500 group-hover:text-brand transition-colors" />
                            Animes
                        </div>
                        <ChevronRight size={16} className="text-gray-600" />
                    </button>

                    <button 
                        onClick={() => setMobileSubMenu('cartoons')}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors group"
                    >
                        <div className="flex items-center gap-4">
                            <Smile size={18} className="text-gray-500 group-hover:text-brand transition-colors" />
                            Desenhos
                        </div>
                        <ChevronRight size={16} className="text-gray-600" />
                    </button>

                    <MobileLink 
                        icon={<Grid size={18} />} 
                        label="Catálogo Completo"
                        active={currentView === 'browse'}
                        onClick={() => handleLinkClick('browse')} 
                    />
                  </div>

                  <div className="h-px bg-white/5 my-6 mx-2"></div>

                  <div className="space-y-2">
                    {user ? (
                        <button onClick={() => { signOut(); setIsMobileMenuOpen(false); handleLinkClick('home'); }} className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors">
                            <LogOut size={18} /> Sair
                        </button>
                    ) : (
                        <button onClick={() => handleLinkClick('profile')} className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                            <Settings size={18} /> Configurações
                        </button>
                    )}
                  </div>
              </div>

              {/* Submenus Mobile */}
              
              {/* Movies Submenu */}
              <div 
                className={`absolute inset-0 flex flex-col bg-[#0a0a0a] transition-transform duration-300 ${
                  mobileSubMenu === 'movies' ? 'translate-x-0' : 'translate-x-full'
                }`}
              >
                 <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
                    <button onClick={() => setMobileSubMenu('main')} className="p-1 -ml-2 text-gray-400 hover:text-white">
                        <ChevronLeft size={24} />
                    </button>
                    <h3 className="font-bold text-white">Filmes</h3>
                 </div>
                 <div className="flex-1 overflow-y-auto p-5 space-y-2">
                    <button onClick={() => handleLinkClick('browse', { initialTab: 'movies' })} className="w-full text-left py-3 px-2 text-sm text-white font-medium bg-white/5 rounded-lg mb-4">Ver Todos os Filmes</button>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-2">Gêneros</p>
                    {movieGenres.map(g => (
                        <button key={g} onClick={() => handleLinkClick('browse', { initialTab: 'movies', initialGenre: g })} className="w-full text-left py-3 px-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors border-b border-white/5 last:border-0">
                            {g}
                        </button>
                    ))}
                 </div>
              </div>

              {/* Series Submenu */}
              <div 
                className={`absolute inset-0 flex flex-col bg-[#0a0a0a] transition-transform duration-300 ${
                  mobileSubMenu === 'series' ? 'translate-x-0' : 'translate-x-full'
                }`}
              >
                 <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
                    <button onClick={() => setMobileSubMenu('main')} className="p-1 -ml-2 text-gray-400 hover:text-white">
                        <ChevronLeft size={24} />
                    </button>
                    <h3 className="font-bold text-white">Séries</h3>
                 </div>
                 <div className="flex-1 overflow-y-auto p-5 space-y-2">
                    <button onClick={() => handleLinkClick('browse', { initialTab: 'series' })} className="w-full text-left py-3 px-2 text-sm text-white font-medium bg-white/5 rounded-lg mb-4">Ver Todas as Séries</button>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-2">Categorias</p>
                    {seriesGenres.map(g => (
                        <button key={g} onClick={() => handleLinkClick('browse', { initialTab: 'series', initialGenre: g })} className="w-full text-left py-3 px-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors border-b border-white/5 last:border-0">
                            {g}
                        </button>
                    ))}
                 </div>
              </div>

              {/* Animes Submenu */}
              <div 
                className={`absolute inset-0 flex flex-col bg-[#0a0a0a] transition-transform duration-300 ${
                  mobileSubMenu === 'animes' ? 'translate-x-0' : 'translate-x-full'
                }`}
              >
                 <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
                    <button onClick={() => setMobileSubMenu('main')} className="p-1 -ml-2 text-gray-400 hover:text-white">
                        <ChevronLeft size={24} />
                    </button>
                    <h3 className="font-bold text-white">Animes</h3>
                 </div>
                 <div className="flex-1 overflow-y-auto p-5 space-y-2">
                    <button onClick={() => handleLinkClick('browse', { initialTab: 'animes' })} className="w-full text-left py-3 px-2 text-sm text-white font-medium bg-white/5 rounded-lg mb-4">Ver Todos os Animes</button>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-2">Gêneros</p>
                    {animeGenres.map(g => (
                        <button key={g} onClick={() => handleLinkClick('browse', { initialTab: 'animes', initialGenre: g })} className="w-full text-left py-3 px-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors border-b border-white/5 last:border-0">
                            {g}
                        </button>
                    ))}
                 </div>
              </div>

              {/* Cartoons Submenu */}
              <div 
                className={`absolute inset-0 flex flex-col bg-[#0a0a0a] transition-transform duration-300 ${
                  mobileSubMenu === 'cartoons' ? 'translate-x-0' : 'translate-x-full'
                }`}
              >
                 <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
                    <button onClick={() => setMobileSubMenu('main')} className="p-1 -ml-2 text-gray-400 hover:text-white">
                        <ChevronLeft size={24} />
                    </button>
                    <h3 className="font-bold text-white">Desenhos</h3>
                 </div>
                 <div className="flex-1 overflow-y-auto p-5 space-y-2">
                    <button onClick={() => handleLinkClick('browse', { initialTab: 'cartoons' })} className="w-full text-left py-3 px-2 text-sm text-white font-medium bg-white/5 rounded-lg mb-4">Ver Todos os Desenhos</button>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-2">Categorias</p>
                    {cartoonGenres.map(g => (
                        <button key={g} onClick={() => handleLinkClick('browse', { initialTab: 'cartoons', initialGenre: g })} className="w-full text-left py-3 px-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors border-b border-white/5 last:border-0">
                            {g}
                        </button>
                    ))}
                 </div>
              </div>

          </div>
        </div>
      </div>
    </>
  );
};

const MobileLink = ({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) => (
    <button 
        onClick={onClick}
        className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 active:scale-[0.98] ${
            active 
              ? 'bg-brand text-white shadow-lg shadow-brand/10' 
              : 'text-gray-400 hover:text-white hover:bg-white/5'
        }`}
    >
        <span className={active ? 'text-white' : 'text-gray-500'}>
          {icon}
        </span>
        {label}
    </button>
);