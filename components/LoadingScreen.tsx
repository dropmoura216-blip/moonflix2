import React from 'react';
import { Logo } from './Logo';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[100] bg-[#000807] flex flex-col items-center justify-center transition-opacity duration-500">
      
      {/* Logo Pulsante */}
      <div className="mb-8 animate-pulse">
        <Logo size="xl" />
      </div>

      {/* Spinner Customizado */}
      <div className="relative w-16 h-16">
        {/* Anel de fundo */}
        <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
        {/* Anel que gira (Spinner) */}
        <div className="absolute inset-0 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
      </div>

      <p className="mt-6 text-gray-500 text-xs uppercase tracking-widest animate-pulse font-medium">
        Carregando Catálogo...
      </p>
    </div>
  );
};