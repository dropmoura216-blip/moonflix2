import React from 'react';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-background border-t border-white/5 py-12 px-4 md:px-12 mt-10 mb-20 md:mb-0">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        
        <div className="flex flex-col items-center md:items-start gap-2">
            <Logo size="md" />
            <p className="text-gray-500 text-xs mt-1">© 2024 MoonFlix Streaming. Todos os direitos reservados.</p>
        </div>

        <div className="flex gap-6 text-xs text-gray-400 font-medium">
            <a href="#" className="hover:text-brand transition-colors">Política de Privacidade</a>
            <a href="#" className="hover:text-brand transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-brand transition-colors">Ajuda</a>
        </div>

        <div className="flex gap-3">
            {/* Social Icons Placeholders */}
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-brand/20 hover:text-brand transition-colors cursor-pointer text-gray-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </div>
             <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-brand/20 hover:text-brand transition-colors cursor-pointer text-gray-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </div>
        </div>

      </div>
    </footer>
  );
};