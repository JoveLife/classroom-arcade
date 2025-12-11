import React from 'react';

interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'cyan' | 'pink' | 'gold';
  size?: 'md' | 'lg';
}

const NeonButton: React.FC<NeonButtonProps> = ({ 
  children, 
  variant = 'cyan', 
  size = 'md', 
  className = '',
  ...props 
}) => {
  const baseStyles = "relative font-bold uppercase tracking-wider border-2 rounded-lg transition-all duration-300 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    cyan: "border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-slate-900 shadow-[0_0_10px_rgba(34,211,238,0.2)] hover:shadow-[0_0_20px_rgba(34,211,238,0.6)]",
    pink: "border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white shadow-[0_0_10px_rgba(236,72,153,0.2)] hover:shadow-[0_0_20px_rgba(236,72,153,0.6)]",
    gold: "border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-slate-900 shadow-[0_0_10px_rgba(250,204,21,0.2)] hover:shadow-[0_0_20px_rgba(250,204,21,0.6)]",
  };

  const sizes = {
    md: "px-6 py-2 text-sm",
    lg: "px-10 py-4 text-xl",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default NeonButton;