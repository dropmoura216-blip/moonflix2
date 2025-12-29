import React from 'react';
import { Home, Search, Grid, User } from 'lucide-react';
import { ViewState } from '../types';

interface BottomNavProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onNavigate }) => {
  const navItems = [
    { id: 'home', label: 'Início', icon: Home },
    { id: 'search', label: 'Buscar', icon: Search },
    { id: 'browse', label: 'Catálogo', icon: Grid },
    { id: 'profile', label: 'Perfil', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full z-[90] md:hidden bg-[#000807]/90 backdrop-blur-xl border-t border-white/10 pb-safe transition-all duration-300">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as ViewState)}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-all active:scale-90 group ${
                isActive ? 'text-brand' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <div className={`relative p-1.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-brand/10' : 'bg-transparent'}`}>
                <Icon 
                  size={22} 
                  className={`transition-all duration-300 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`}
                  fill={isActive && item.id === 'home' ? "currentColor" : "none"} 
                />
                {isActive && (
                  <span className="absolute inset-0 bg-brand/20 blur-lg rounded-full opacity-50"></span>
                )}
              </div>
              <span className={`text-[10px] font-medium tracking-wide transition-colors ${isActive ? 'text-white' : 'text-gray-500'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};