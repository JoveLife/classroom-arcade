import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Upload, Trophy, Clover, RefreshCw, X, Check, ZoomIn, RotateCw, ArrowRight } from 'lucide-react';
import NeonButton from '../../components/NeonButton';
import { Candidate } from '../../types';

// --- Styles for Animations (Injected) ---
const AnimationStyles = () => (
  <style>{`
    @keyframes moveCenterFromLeft {
      0% { transform: perspective(800px) rotateY(0deg); }
      100% { 
        transform: perspective(800px) translateX(230px) scale(1.15) rotateY(0deg); 
        box-shadow: 0 0 50px #22d3ee;
        z-index: 100;
        border-color: #22d3ee;
      }
    }
    @keyframes moveCenterFromRight {
      0% { transform: perspective(800px) rotateY(0deg); }
      100% { 
        transform: perspective(800px) translateX(-230px) scale(1.15) rotateY(0deg); 
        box-shadow: 0 0 50px #22d3ee;
        z-index: 100;
        border-color: #22d3ee;
      }
    }
    @keyframes shatterFade {
      0% { transform: perspective(800px) scale(1); opacity: 1; }
      20% { transform: perspective(800px) scale(0.95) rotate(5deg); opacity: 0.8; filter: hue-rotate(90deg) blur(2px); }
      40% { transform: perspective(800px) scale(0.9) rotate(-5deg); opacity: 0.6; filter: hue-rotate(180deg) blur(5px); }
      60% { transform: perspective(800px) scale(0.85) skew(20deg); opacity: 0.4; border-color: #ff4d4d; }
      100% { transform: perspective(800px) scale(0) rotate(0deg); opacity: 0; }
    }
    @keyframes popUp {
      0% { opacity: 0; transform: scale(0.5) rotateY(180deg); }
      100% { opacity: 1; transform: scale(1) rotateY(0deg); }
    }
    
    .anim-win-left { animation: moveCenterFromLeft 0.8s forwards cubic-bezier(0.2, 0.8, 0.2, 1); }
    .anim-win-right { animation: moveCenterFromRight 0.8s forwards cubic-bezier(0.2, 0.8, 0.2, 1); }
    .anim-lose { animation: shatterFade 0.8s forwards ease-in; pointer-events: none; }
    .anim-pop { animation: popUp 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
    
    /* Responsive Adjustments for Animation */
    @media (max-width: 768px) {
      /* Mobile: Left (Top) moves Down, Right (Bottom) moves Up */
      @keyframes moveCenterFromLeft { 
        0% { transform: perspective(800px) rotateX(0deg); }
        100% { transform: scale(1.05) translateY(40px); z-index: 100; box-shadow: 0 0 30px #22d3ee; border-color: #22d3ee; } 
      }
      @keyframes moveCenterFromRight { 
        0% { transform: perspective(800px) rotateX(0deg); }
        100% { transform: scale(1.05) translateY(-40px); z-index: 100; box-shadow: 0 0 30px #22d3ee; border-color: #22d3ee; } 
      }
    }
  `}</style>
);

// --- 3D Card Component ---
interface CardProps {
  candidate: Candidate;
  onClick?: () => void;
  onZoom?: (e: React.MouseEvent) => void;
  id: string;
  className?: string;
  isWinner?: boolean;
  isBye?: boolean;
  showName?: boolean;
}

const GameCard: React.FC<CardProps> = ({ candidate, onClick, onZoom, id, className = '', isWinner, isBye, showName = true }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current || className.includes('anim-')) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate rotation (tilted 3D effect)
    const rotateY = -1/15 * (x - rect.width/2);
    const rotateX = 1/15 * (y - rect.height/2);
    
    cardRef.current.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

    // Hologram overlay effect
    const overlay = cardRef.current.querySelector('.holo-overlay') as HTMLElement;
    if (overlay) {
      overlay.style.filter = `opacity(${x/rect.width + y/rect.height}) brightness(1.2)`;
      overlay.style.backgroundPosition = `${x/5 + y/5}%`;
    }
  };

  const handleMouseOut = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg)';
    const overlay = cardRef.current.querySelector('.holo-overlay') as HTMLElement;
    if (overlay) overlay.style.filter = 'opacity(0)';
  };

  // Adjusted size classes for mobile responsiveness
  // Significantly reduced mobile height for winner/bye cards to allow space for header/footer
  // Desktop height also reduced to 60vh to prevent scrolling on standard laptop screens
  // Changed mobile playing width from w-full to w-[85%] to prevent glow clipping during animation
  const sizeClasses = isWinner || isBye 
    ? "w-[80vw] h-[50vh] md:w-auto md:h-[60vh] md:aspect-[3/4] md:max-h-[650px]" 
    : "w-[85%] h-full max-h-[35vh] md:max-h-none md:w-[400px] md:h-[540px]"; 

  const borderClass = isWinner 
    ? "border-yellow-400 shadow-[0_0_50px_rgba(250,204,21,0.3)]" 
    : isBye 
      ? "border-green-400 shadow-[0_0_50px_rgba(74,222,128,0.3)]"
      : "border-slate-700 hover:border-cyan-500/50";

  return (
    <div
      id={id}
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseOut}
      className={`
        relative bg-slate-800 rounded-2xl cursor-pointer
        transition-all duration-100 ease-out will-change-transform
        flex flex-col items-center p-3 md:p-4 border-2
        ${sizeClasses} ${borderClass} ${className}
        shrink-0
      `}
    >
      {/* Holographic Overlay */}
      <div className="holo-overlay absolute inset-0 rounded-2xl z-10 pointer-events-none transition-all duration-100 opacity-0 bg-gradient-to-tr from-transparent via-cyan-400/20 to-purple-500/20 mix-blend-color-dodge" />

      {/* Image Container with Blurred Background */}
      <div className="w-full flex-grow bg-slate-900 rounded-xl overflow-hidden relative flex items-center justify-center mb-2 md:mb-4 z-0 min-h-0">
        
        {/* 1. Blurred Background Image (Fills the container) */}
        <div 
            className="absolute inset-0 bg-cover bg-center opacity-50 blur-lg scale-110"
            style={{ 
              backgroundImage: `url(${candidate.imgUrl})`,
              transform: `scale(1.1) rotate(${candidate.rotation || 0}deg)`
            }}
        />

        {/* 2. Main Image (Contained, prevents cropping) */}
        <img 
            src={candidate.imgUrl} 
            alt={candidate.name} 
            className="relative z-10 w-full h-full object-contain drop-shadow-xl transition-transform duration-300" 
            style={{ transform: `rotate(${candidate.rotation || 0}deg)` }}
        />
        
        {/* Zoom Button (Desktop & Mobile) */}
        {!isWinner && !isBye && (
            <button
                onClick={onZoom}
                className="absolute bottom-2 right-2 z-30 p-2 rounded-full bg-black/50 hover:bg-cyan-500/80 text-white/70 hover:text-white transition-all hover:scale-110 group"
                aria-label="크게 보기"
            >
                <ZoomIn className="w-4 h-4 md:w-5 md:h-5 group-hover:rotate-12 transition-transform" />
            </button>
        )}
      </div>

      {/* Name */}
      {showName && (
        <div className={`
          text-center font-bold z-10 min-h-[24px] md:min-h-[40px] flex items-center justify-center w-full px-1 break-keep leading-tight
          ${isWinner ? "text-2xl md:text-3xl text-yellow-400 drop-shadow-md" : isBye ? "text-xl md:text-2xl text-green-400" : "text-base md:text-2xl text-white"}
        `}>
          {candidate.name}
        </div>
      )}
    </div>
  );
};

// --- Main Game Component ---

const WorldCupGame: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [currentRound, setCurrentRound] = useState<Candidate[]>([]);
  const [nextRound, setNextRound] = useState<Candidate[]>([]);
  const [currentPairIndex, setCurrentPairIndex] = useState(0);
  const [phase, setPhase] = useState<'setup' | 'playing' | 'bye' | 'winner'>('setup');
  const [animatingSide, setAnimatingSide] = useState<'left' | 'right' | null>(null);
  const [winner, setWinner] = useState<Candidate | null>(null);
  const [byeCandidate, setByeCandidate] = useState<Candidate | null>(null);
  const [showNames, setShowNames] = useState(true);

  // Preview State
  const [previewSelection, setPreviewSelection] = useState<{side: 'left' | 'right' | null, candidate: Candidate} | null>(null);

  // Setup: Handle File Input
  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files) as File[];
      const imageFiles = files.filter(f => f.type.startsWith('image/'));

      if (imageFiles.length < 2) {
        alert("최소 2장의 이미지가 필요합니다.");
        return;
      }

      const newCandidates: Candidate[] = imageFiles.map((file, idx) => ({
        id: `cand-${idx}`,
        name: file.name.substring(0, file.name.lastIndexOf('.')) || file.name,
        imgUrl: URL.createObjectURL(file),
        file,
        rotation: 0
      }));

      setCandidates(newCandidates);
      startGame(newCandidates);
    }
  };

  // Logic: Start/Restart Game
  const startGame = (initialCandidates: Candidate[]) => {
    // Shuffle
    const shuffled = [...initialCandidates].sort(() => Math.random() - 0.5);
    setCurrentRound(shuffled);
    setNextRound([]);
    setCurrentPairIndex(0);
    setPhase('playing');
    setWinner(null);
    setByeCandidate(null);
    setPreviewSelection(null);
  };

  // Card Click: Select Winner directly (Desktop) or just wrapper
  const handleCardClick = (side: 'left' | 'right') => {
    if (animatingSide) return;
    selectWinner(side);
  };

  // Zoom Click: Open Preview
  const handleZoomClick = (e: React.MouseEvent, side: 'left' | 'right', candidate: Candidate) => {
    e.stopPropagation(); // Prevent triggering card selection
    setPreviewSelection({ side, candidate });
  };

  // Rotation Logic
  const handleRotate = () => {
    if (!previewSelection) return;

    const { candidate } = previewSelection;
    const newRotation = ((candidate.rotation || 0) + 90) % 360;
    const updatedCandidate = { ...candidate, rotation: newRotation };

    // Update in all lists to ensure persistence
    const updateList = (list: Candidate[]) => list.map(c => c.id === candidate.id ? updatedCandidate : c);

    setCandidates(updateList(candidates));
    setCurrentRound(updateList(currentRound));
    setNextRound(updateList(nextRound));
    
    // Update preview state immediately
    setPreviewSelection(prev => prev ? { ...prev, candidate: updatedCandidate } : null);
  };

  // Logic: Select Winner of Pair
  const selectWinner = (side: 'left' | 'right') => {
    if (animatingSide) return; // Prevent double clicks
    
    // Close preview if open
    setPreviewSelection(null);

    setAnimatingSide(side);
    const winner = side === 'left' ? currentRound[currentPairIndex] : currentRound[currentPairIndex + 1];
    
    // Create the updated next round list immediately to avoid stale state in timeouts
    const updatedNextRound = [...nextRound, winner];
    setNextRound(updatedNextRound);

    setTimeout(() => {
      setAnimatingSide(null);
      const nextIndex = currentPairIndex + 2;

      // Check if we have 1 candidate left (Bye) or 0 left (Round End)
      if (nextIndex === currentRound.length - 1) {
         // Odd number handling: One remaining -> Bye round
         handleByeRound(currentRound[nextIndex], updatedNextRound);
      } else if (nextIndex >= currentRound.length) {
         // Round complete
         advanceRound(updatedNextRound);
      } else {
        setCurrentPairIndex(nextIndex);
      }
    }, 1200);
  };

  const handleByeRound = (luckyOne: Candidate, currentNextRound: Candidate[]) => {
    setByeCandidate(luckyOne);
    setPhase('bye');
    
    // Add lucky one to the next round list
    const finalNextRound = [...currentNextRound, luckyOne];
    setNextRound(finalNextRound);
    
    // Removed automatic timeout
  };

  const advanceRound = (manualNextRound?: Candidate[]) => {
    const roundToProcess = manualNextRound || nextRound;
    
    if (roundToProcess.length === 1) {
      setWinner(roundToProcess[0]);
      setPhase('winner');
    } else {
      // Shuffle next round
      const shuffled = [...roundToProcess].sort(() => Math.random() - 0.5);
      setCurrentRound(shuffled);
      setNextRound([]);
      setCurrentPairIndex(0);
      setPhase('playing');
    }
  };

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      candidates.forEach(c => URL.revokeObjectURL(c.imgUrl));
    };
  }, []);

  // --- Render ---

  if (phase === 'setup') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-fade-in overflow-y-auto">
        <div className="bg-slate-800/80 p-12 rounded-3xl border border-slate-700 shadow-2xl max-w-2xl w-full backdrop-blur-md">
          <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
          <h2 className="text-4xl font-bold mb-4 text-white">이상형 월드컵</h2>
          <p className="text-slate-400 mb-10 text-lg break-keep">
            이미지들이 들어있는 폴더를 선택하세요.<br/>
            홀로그램 스타일로 대결이 진행됩니다.
          </p>
          
          <div className="relative inline-block group">
            <NeonButton size="lg" className="pl-12 pr-12 group-hover:bg-cyan-400 group-hover:text-slate-900 group-hover:shadow-[0_0_20px_rgba(34,211,238,0.6)]">
              <Upload className="w-6 h-6 inline-block mr-3 mb-1" />
              폴더 선택하기
            </NeonButton>
            <input 
              type="file" 
              multiple 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              // React workaround for webkitdirectory
              ref={(input) => {
                if (input) {
                  input.setAttribute('webkitdirectory', '');
                  input.setAttribute('directory', '');
                }
              }}
              onChange={handleFiles}
            />
          </div>

          <div className="mt-8 flex items-center justify-center gap-3 bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
             <label className="relative inline-flex items-center cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={showNames} 
                  onChange={(e) => setShowNames(e.target.checked)} 
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500 group-hover:ring-2 group-hover:ring-cyan-500/30"></div>
                <span className="ms-3 text-md font-medium text-slate-300 group-hover:text-white transition-colors">이름 표시하기</span>
              </label>
          </div>
          
          <p className="mt-6 text-sm text-slate-500 font-mono">* 최소 2장 이상의 이미지가 필요합니다.</p>
        </div>
      </div>
    );
  }

  if (phase === 'winner' && winner) {
    return (
      <div className="h-full w-full overflow-y-auto custom-scrollbar relative">
        <AnimationStyles />
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-500/20 via-slate-900 to-slate-900 pointer-events-none" />
        
        <div className="flex flex-col items-center justify-center min-h-full p-4 py-8 relative z-10">
            {/* Reduced text size for better fit on desktops */}
            <h1 className="text-4xl md:text-6xl font-bold text-yellow-400 mb-6 md:mb-8 drop-shadow-[0_0_25px_rgba(250,204,21,0.6)] animate-pulse z-10 text-center">
            🎉 최종 우승 🎉
            </h1>

            <div className="anim-pop z-20">
                <GameCard candidate={winner} id="winner-card" isWinner showName={showNames} />
            </div>

            <NeonButton 
            variant="cyan" 
            size="lg" 
            className="mt-8 md:mt-8 z-20"
            onClick={() => setPhase('setup')}
            >
            <RefreshCw className="w-5 h-5 inline-block mr-2 mb-0.5" />
            다시 시작하기
            </NeonButton>
        </div>
      </div>
    );
  }

  if (phase === 'bye' && byeCandidate) {
    return (
      <div className="h-full w-full overflow-y-auto custom-scrollbar relative">
        <AnimationStyles />
        <div className="flex flex-col items-center justify-center min-h-full p-4 py-8 relative z-10">
            <h1 className="text-3xl md:text-6xl font-bold text-green-400 mb-6 md:mb-8 drop-shadow-[0_0_20px_rgba(74,222,128,0.5)] z-10 flex items-center gap-4">
            <Clover className="w-8 h-8 md:w-20 md:h-20" />
            운 좋은 부전승!
            </h1>

            <div className="anim-pop z-20">
                <GameCard candidate={byeCandidate} id="bye-card" isBye showName={showNames} />
            </div>
            <p className="mt-6 md:mt-8 text-slate-400 z-20 text-lg text-center mb-6">짝이 맞지 않아 자동으로 다음 라운드에 진출합니다.</p>

            <NeonButton 
                variant="cyan" 
                size="lg" 
                className="z-20"
                onClick={() => advanceRound()}
            >
                <ArrowRight className="w-6 h-6 inline-block mr-2" />
                다음 라운드 진행
            </NeonButton>
        </div>
      </div>
    );
  }

  // Playing Phase
  const leftCandidate = currentRound[currentPairIndex];
  const rightCandidate = currentRound[currentPairIndex + 1];
  const roundName = currentRound.length === 2 ? "결승전" : `${currentRound.length}강`;

  // Safeguard: Ensure candidates exist before rendering
  if (!leftCandidate || !rightCandidate) {
    return null;
  }

  return (
    <div className="flex flex-col items-center h-full w-full py-2 md:py-8 px-2 md:px-4 relative overflow-hidden">
      <AnimationStyles />

      {/* --- Preview / Zoom Modal (Portal to body) --- */}
      {previewSelection && createPortal(
        <div className="fixed inset-0 z-[9999] flex flex-col bg-slate-950/95 backdrop-blur-xl animate-fade-in">
            {/* Action Bar (Top) */}
            <div className="absolute top-5 left-5 right-5 flex justify-between items-center z-50">
               <button
                  onClick={handleRotate}
                  className="p-3 rounded-full bg-slate-800/80 border border-slate-600 text-white shadow-lg active:scale-95 hover:bg-slate-700 transition-all flex items-center gap-2"
               >
                  <RotateCw className="w-6 h-6" />
                  <span className="text-sm font-bold hidden sm:inline">회전</span>
               </button>

               <button 
                  onClick={() => setPreviewSelection(null)}
                  className="p-3 rounded-full bg-slate-800/80 border border-slate-600 text-white shadow-lg active:scale-95 hover:bg-slate-700 transition-all"
                  aria-label="닫기"
               >
                  <X className="w-8 h-8" />
               </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 w-full overflow-hidden">
                 {/* Image Container */}
                <div className="w-full max-h-[55vh] aspect-[3/4] relative rounded-2xl overflow-hidden bg-black shadow-2xl border-2 border-slate-700 mb-6 flex items-center justify-center">
                    <img 
                        src={previewSelection.candidate.imgUrl} 
                        alt={previewSelection.candidate.name} 
                        className="max-w-full max-h-full object-contain transition-transform duration-300"
                        style={{ transform: `rotate(${previewSelection.candidate.rotation || 0}deg)` }}
                    />
                </div>
                
                {/* Name */}
                {showNames && (
                    <h3 className="text-3xl font-bold text-white text-center drop-shadow-md px-2 leading-tight break-keep">
                        {previewSelection.candidate.name}
                    </h3>
                )}
            </div>

            {/* Action Buttons */}
            <div className="p-6 pb-10 w-full flex flex-col gap-3 bg-slate-900/80 border-t border-slate-800">
                {previewSelection.side && (
                  <NeonButton 
                      variant="cyan" 
                      size="lg" 
                      className="w-full flex items-center justify-center gap-2 text-xl py-5"
                      onClick={() => selectWinner(previewSelection.side!)}
                  >
                      <Check className="w-6 h-6" />
                      선택하기
                  </NeonButton>
                )}
                
                <button 
                    onClick={() => setPreviewSelection(null)}
                    className="w-full py-4 rounded-lg text-slate-400 font-bold hover:text-white hover:bg-slate-800 transition-colors text-lg"
                >
                    취소
                </button>
            </div>
        </div>,
        document.body
      )}
      
      {/* Round Badge - Liquid Glass Style */}
      <div className={`
        px-6 md:px-10 py-2 md:py-3 rounded-full text-lg md:text-2xl font-bold mb-3 md:mb-8 z-30
        backdrop-blur-xl bg-gradient-to-b from-white/10 to-white/5 border border-white/20 
        shadow-[inset_0_0_20px_rgba(255,255,255,0.05),_0_8px_32px_0_rgba(0,0,0,0.3)]
        ${currentRound.length === 2 ? 'text-pink-300 animate-pulse border-pink-500/30' : 'text-cyan-300'}
        sticky top-0
      `}>
        {roundName} {currentRound.length > 2 && <span className="text-sm opacity-80 ml-2">({currentPairIndex / 2 + 1} / {currentRound.length / 2})</span>}
      </div>

      {/* 
        Layout Container: 
        - Mobile: flex-col (Top/Bottom) - gap-2
        - Desktop: flex-row (Left/Right) - gap-20
      */}
      <div className="flex-1 w-full max-w-7xl flex flex-col md:flex-row items-center justify-center gap-3 md:gap-20 perspective-[1200px] relative z-10 min-h-0">
        
        {/* Left Card Wrapper (Top on Mobile) */}
        <div className="relative flex-1 w-full md:w-auto flex justify-center items-end md:items-center">
            <GameCard 
                id="card-left"
                candidate={leftCandidate}
                onClick={() => handleCardClick('left')}
                onZoom={(e) => handleZoomClick(e, 'left', leftCandidate)}
                className={animatingSide === 'left' ? 'anim-win-left' : animatingSide === 'right' ? 'anim-lose' : ''}
                showName={showNames}
            />
        </div>

        {/* VS Text */}
        <div className={`
            absolute md:static top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 md:transform-none z-30 pointer-events-none md:pointer-events-auto
            text-4xl md:text-8xl font-black italic text-slate-100/80 md:text-slate-700/50 
            drop-shadow-[0_0_10px_rgba(0,0,0,0.8)] md:drop-shadow-none
            transition-opacity duration-300 select-none
            ${animatingSide ? 'opacity-0' : 'opacity-100'}
        `}>
            VS
        </div>

        {/* Right Card Wrapper (Bottom on Mobile) */}
        <div className="relative flex-1 w-full md:w-auto flex justify-center items-start md:items-center">
            <GameCard 
                id="card-right"
                candidate={rightCandidate}
                onClick={() => handleCardClick('right')}
                onZoom={(e) => handleZoomClick(e, 'right', rightCandidate)}
                className={animatingSide === 'right' ? 'anim-win-right' : animatingSide === 'left' ? 'anim-lose' : ''}
                showName={showNames}
            />
        </div>

      </div>
    </div>
  );
};

export default WorldCupGame;