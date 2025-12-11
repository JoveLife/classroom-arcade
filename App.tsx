import React, { useState } from 'react';
import Layout from './components/Layout';
import WorldCupGame from './games/worldcup/WorldCupGame';
import MemoryGame from './games/memory/MemoryGame';
import { Trophy, ArrowRight, BrainCircuit, ChevronLeft, ChevronRight, Construction } from 'lucide-react';

type Screen = 'dashboard' | 'worldcup' | 'memory';

// --- Game Definitions ---
interface GameDef {
  id: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  color: 'cyan' | 'green' | 'slate';
  disabled?: boolean;
}

const GAMES: GameDef[] = [
  {
    id: 'worldcup',
    title: '이상형 월드컵',
    desc: '폴더의 이미지를 사용하여 토너먼트 대결을 펼칩니다.',
    icon: <Trophy className="w-8 h-8 md:w-10 md:h-10 text-cyan-400" />,
    color: 'cyan'
  },
  {
    id: 'memory',
    title: '네온 메모리',
    desc: '카드를 뒤집어 짝을 맞추는 기억력 게임입니다.',
    icon: <BrainCircuit className="w-8 h-8 md:w-10 md:h-10 text-green-400" />,
    color: 'green'
  },
  {
    id: 'coming_soon',
    title: 'Coming Soon',
    desc: '새로운 게임이 준비 중입니다.',
    icon: <Construction className="w-8 h-8 md:w-10 md:h-10 text-slate-500" />,
    color: 'slate',
    disabled: true
  }
];

function App() {
  const [screen, setScreen] = useState<Screen>('dashboard');

  const renderContent = () => {
    switch (screen) {
      case 'worldcup':
        return <WorldCupGame />;
      case 'memory':
        return <MemoryGame />;
      case 'dashboard':
      default:
        return <Dashboard onSelectGame={(id) => setScreen(id as Screen)} />;
    }
  };

  return (
    <Layout 
      onHomeClick={() => setScreen('dashboard')} 
      showHomeButton={screen !== 'dashboard'}
    >
      {renderContent()}
    </Layout>
  );
}

// --- Dashboard Component ---

interface DashboardProps {
  onSelectGame: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onSelectGame }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % GAMES.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + GAMES.length) % GAMES.length);
  };

  const handleSelect = (game: GameDef) => {
    if (!game.disabled) {
      onSelectGame(game.id);
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full h-full overflow-hidden relative bg-slate-900">
      
      {/* Title Section (Common) */}
      <div className="text-center pt-8 pb-4 md:pt-12 md:pb-12 shrink-0 z-10 px-4">
        <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white drop-shadow-[0_0_10px_rgba(250,250,250,0.3)] font-arcade">
          GAME SELECT
        </h2>
        <p className="text-slate-400 text-sm md:text-xl max-w-2xl mx-auto break-keep leading-relaxed">
          교실에서 함께 즐기는 인터랙티브 게임 플랫폼
        </p>
      </div>

      {/* --- Desktop View: Grid Layout --- */}
      <div className="hidden md:flex flex-1 justify-center overflow-y-auto pb-10 px-8">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl content-center">
          {GAMES.map((game) => (
            <div 
              key={game.id}
              onClick={() => handleSelect(game)}
              className={`
                group relative bg-slate-800 border border-slate-700 rounded-2xl p-1 overflow-hidden transition-all duration-300
                ${game.disabled 
                  ? 'opacity-60 cursor-not-allowed' 
                  : 'cursor-pointer hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(0,0,0,0.5)]'
                }
                ${game.color === 'cyan' ? 'hover:border-cyan-400 hover:shadow-cyan-500/20' : ''}
                ${game.color === 'green' ? 'hover:border-green-400 hover:shadow-green-500/20' : ''}
                ${game.color === 'slate' ? 'border-dashed' : ''}
              `}
            >
              <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity
                ${game.color === 'cyan' ? 'from-cyan-500/10 to-purple-500/10' : ''}
                ${game.color === 'green' ? 'from-green-500/10 to-blue-500/10' : ''}
              `} />
              
              <div className="bg-slate-900/90 rounded-xl h-full p-6 flex flex-col relative z-10 min-h-[300px]">
                <div className={`
                  w-16 h-16 rounded-lg flex items-center justify-center mb-6 transition-colors
                  ${game.disabled ? 'bg-slate-800' : 'bg-slate-800 group-hover:bg-slate-700'}
                `}>
                  {game.icon}
                </div>
                
                <h3 className={`text-2xl font-bold mb-2 transition-colors
                   ${game.color === 'cyan' ? 'text-white group-hover:text-cyan-300' : ''}
                   ${game.color === 'green' ? 'text-white group-hover:text-green-300' : ''}
                   ${game.color === 'slate' ? 'text-slate-500' : ''}
                `}>
                  {game.title}
                </h3>
                <p className="text-slate-400 mb-6 flex-grow break-keep text-sm leading-relaxed">
                  {game.desc}
                </p>
                
                {!game.disabled && (
                  <div className={`
                    flex items-center text-sm font-bold uppercase tracking-wider
                    ${game.color === 'cyan' ? 'text-cyan-500' : ''}
                    ${game.color === 'green' ? 'text-green-500' : ''}
                  `}>
                    Play Now <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- Mobile View: 3D Carousel --- */}
      <div className="md:hidden flex-1 flex flex-col items-center justify-center relative overflow-hidden pb-10">
        
        <div className="relative w-full h-[360px] flex items-center justify-center perspective-[1000px]">
          {GAMES.map((game, index) => {
            // Determine relative position (-1, 0, 1) handling array wrap-around
            let offset = index - currentIndex;
            if (offset < -1) offset += GAMES.length;
            if (offset > 1) offset -= GAMES.length;
            
            // Only render items within window of 1
            if (Math.abs(offset) > 1 && GAMES.length > 2) return null; 
            
            const isActive = offset === 0;
            const isPrev = offset === -1;
            const isNext = offset === 1;

            let transform = 'translateZ(-200px) scale(0.8) opacity(0)';
            let zIndex = 0;
            let opacity = 0;

            if (isActive) {
              transform = 'translateX(0) translateZ(0) scale(1) rotateY(0deg)';
              zIndex = 20;
              opacity = 1;
            } else if (isPrev) {
              transform = 'translateX(-60%) translateZ(-100px) scale(0.85) rotateY(15deg)';
              zIndex = 10;
              opacity = 0.6;
            } else if (isNext) {
              transform = 'translateX(60%) translateZ(-100px) scale(0.85) rotateY(-15deg)';
              zIndex = 10;
              opacity = 0.6;
            }

            return (
               <div 
                key={game.id}
                onClick={() => isActive ? handleSelect(game) : offset < 0 ? handlePrev() : handleNext()}
                className={`
                  absolute w-[75%] max-w-[280px] h-[320px] bg-slate-800 border rounded-2xl p-1 shadow-2xl transition-all duration-500 ease-out
                  ${game.color === 'cyan' ? 'border-cyan-500/50 shadow-cyan-500/20' : ''}
                  ${game.color === 'green' ? 'border-green-500/50 shadow-green-500/20' : ''}
                  ${game.color === 'slate' ? 'border-slate-700' : ''}
                `}
                style={{ 
                  transform, 
                  zIndex, 
                  opacity 
                }}
              >
                <div className="bg-slate-900/95 w-full h-full rounded-xl p-5 flex flex-col items-center text-center">
                   <div className="flex-1 flex flex-col items-center justify-center">
                      <div className={`p-4 rounded-full mb-3 bg-slate-800/50 ring-1 ring-white/10 ${isActive ? 'scale-110' : ''} transition-transform`}>
                        {game.icon}
                      </div>
                      <h3 className={`text-2xl font-bold mb-2 ${isActive ? 'text-white' : 'text-slate-400'}`}>
                        {game.title}
                      </h3>
                      <p className="text-slate-400 text-sm break-keep leading-relaxed line-clamp-3">
                        {game.desc}
                      </p>
                   </div>
                   
                   {!game.disabled && (
                     <div className={`mt-3 px-6 py-2 rounded-full text-sm font-bold bg-slate-800 border transition-colors
                       ${game.color === 'cyan' ? 'text-cyan-400 border-cyan-500/30' : ''}
                       ${game.color === 'green' ? 'text-green-400 border-green-500/30' : ''}
                     `}>
                       {isActive ? '터치하여 시작' : '이동'}
                     </div>
                   )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center gap-8 mt-4 z-30">
          <button 
            onClick={handlePrev}
            className="p-4 rounded-full bg-slate-800 border border-slate-700 text-white active:scale-95 transition-all hover:bg-slate-700"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <div className="flex gap-2">
            {GAMES.map((_, idx) => (
              <div 
                key={idx} 
                className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-white w-6' : 'bg-slate-600'}`} 
              />
            ))}
          </div>

          <button 
            onClick={handleNext}
            className="p-4 rounded-full bg-slate-800 border border-slate-700 text-white active:scale-95 transition-all hover:bg-slate-700"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default App;