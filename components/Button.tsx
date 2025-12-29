import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  icon, 
  className = '', 
  ...props 
}) => {
  // Ajustado: px-6 py-3 (era px-8 py-4), text-sm md:text-base (era base/lg)
  const baseStyles = "flex items-center justify-center gap-2.5 px-6 py-3 rounded-lg font-bold transition-all duration-300 text-sm md:text-base tracking-wide";
  
  const variants = {
    primary: "bg-brand text-white hover:bg-opacity-90 active:scale-95 border border-transparent shadow-lg shadow-brand/20",
    secondary: "bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20 active:scale-95"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="w-5 h-5">{icon}</span>}
      {children}
    </button>
  );
};