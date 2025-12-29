import React from 'react';
import { Settings, Download, HelpCircle, ChevronRight, User, LogOut, List, Shield, Smartphone } from 'lucide-react';

export const MorePage: React.FC = () => {
  
  const MenuItem = ({ icon, label, subLabel = '' }: { icon: React.ReactNode, label: string, subLabel?: string }) => (
    <button className="w-full flex items-center justify-between p-4 bg-secondary/30 hover:bg-secondary border border-white/5 rounded-xl mb-3 transition-all group active:scale-[0.99]">
      <div className="flex items-center gap-4">
        <div className="text-gray-400 group-hover:text-brand transition-colors">
          {icon}
        </div>
        <div className="text-left">
          <div className="text-white font-medium text-sm md:text-base">{label}</div>
          {subLabel && <div className="text-xs text-gray-500">{subLabel}</div>}
        </div>
      </div>
      <ChevronRight size={16} className="text-gray-600" />
    </button>
  );

  return (
    <div className="min-h-screen bg-background pt-24 pb-28 px-4 animate-in slide-in-from-right-4 duration-300">
      <div className="max-w-md mx-auto">
        
        {/* Profile Section */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative w-24 h-24 mb-4">
            <div className="w-full h-full rounded-full bg-gradient-to-tr from-brand to-purple-900 p-[2px]">
              <div className="w-full h-full rounded-full bg-secondary flex items-center justify-center border-4 border-background overflow-hidden">
                <span className="text-3xl font-bold text-white">M</span>
              </div>
            </div>
            <div className="absolute bottom-0 right-0 bg-secondary border border-white/10 p-1.5 rounded-full text-brand">
              <Settings size={14} />
            </div>
          </div>
          <h2 className="text-xl font-bold text-white">MoonUser</h2>
          <button className="text-xs text-brand font-medium mt-1 hover:text-white transition-colors">
            Gerenciar Perfis
          </button>
        </div>

        {/* Menu Groups */}
        
        {/* Content Settings */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 ml-1">Conteúdo</h3>
          <MenuItem 
            icon={<List size={20} />} 
            label="Minha Lista" 
            subLabel="12 títulos salvos"
          />
          <MenuItem 
            icon={<Download size={20} />} 
            label="Downloads" 
            subLabel="3 vídeos (1.2 GB)"
          />
        </div>

        {/* App Settings */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 ml-1">Configurações</h3>
          <MenuItem 
            icon={<Smartphone size={20} />} 
            label="Configurações do App" 
            subLabel="Uso de dados, qualidade de vídeo"
          />
          <MenuItem 
            icon={<User size={20} />} 
            label="Conta" 
            subLabel="Assinatura, e-mail e segurança"
          />
          <MenuItem 
            icon={<Shield size={20} />} 
            label="Privacidade" 
          />
        </div>

        {/* Support */}
        <div className="mb-8">
           <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 ml-1">Suporte</h3>
           <MenuItem 
            icon={<HelpCircle size={20} />} 
            label="Ajuda" 
          />
        </div>

        {/* Logout */}
        <button className="w-full py-4 text-center text-gray-400 font-medium text-sm hover:text-white transition-colors border-t border-white/5">
          <div className="flex items-center justify-center gap-2">
            <LogOut size={16} />
            Sair do MoonFlix
          </div>
        </button>

        <div className="text-center mt-8 mb-4">
           <span className="text-[10px] text-gray-600">Versão 1.0.0 (Build 2024.10)</span>
        </div>

      </div>
    </div>
  );
};