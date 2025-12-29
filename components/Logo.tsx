import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Logo: React.FC<LogoProps> = ({ className = "", size = 'md' }) => {
  
  const textSizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl md:text-3xl',
    lg: 'text-4xl md:text-5xl',
    xl: 'text-5xl md:text-6xl'
  };

  const iconSizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      {/* Icon Container */}
      <div className={`relative flex items-center justify-center ${iconSizeClasses[size]}`}>
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-brand/50 blur-lg rounded-full animate-pulse"></div>
        
        {/* Moon Icon */}
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className="relative z-10 w-full h-full text-brand fill-brand drop-shadow-[0_0_8px_rgba(166,99,204,0.8)]"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Text */}
      <div className={`font-black tracking-tighter leading-none flex items-baseline ${textSizeClasses[size]}`}>
        <span className="text-[#d8b4fe] drop-shadow-[0_0_15px_rgba(166,99,204,0.5)]">Moon</span>
        <span className="text-white drop-shadow-md">Flix</span>
      </div>
    </div>
  );
};