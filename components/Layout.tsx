import React from 'react';
import { Gamepad2, Home } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  onHomeClick: () => void;
  showHomeButton?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, onHomeClick, showHomeButton = true }) => {
  return (
    <div className="h-screen flex flex-col bg-slate-900 text-white relative overflow-hidden selection:bg-cyan-500 selection:text-black">
      {/* Background Ambient Glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="relative z-50 flex items-center justify-between px-8 py-4 border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-3">
          <Gamepad2 className="w-8 h-8 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          <h1 className="text-2xl font-bold font-arcade tracking-wider bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]">
            CLASSROOM ARCADE
          </h1>
        </div>
        
        {showHomeButton && (
          <button 
            onClick={onHomeClick}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors hover:bg-slate-800 rounded-lg group"
          >
            <Home className="w-5 h-5 group-hover:text-cyan-400 transition-colors" />
            <span className="hidden sm:inline">메인으로</span>
          </button>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10 flex flex-col min-h-0 overflow-hidden">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-3 text-center text-slate-600 text-xs shrink-0">
        © 2025 Classroom Arcade Project. All rights reserved.
      </footer>
    </div>
  );
};

export default Layout;