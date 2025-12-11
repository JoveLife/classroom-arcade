import React, { useState, useEffect, useRef } from 'react';
import { Camera, Edit3, Image as ImageIcon, Trash2, Plus, Play, RefreshCw, Clock, Move, ArrowRightLeft, Eye, ArrowLeft } from 'lucide-react';
import NeonButton from '../../components/NeonButton';
import { MemoryCard } from '../../types';

// --- Styles for 3D Flip & Pulse Animations ---
const MemoryStyles = () => (
  <style>{`
    .perspective-1000 { perspective: 1000px; }
    .transform-style-3d { transform-style: preserve-3d; }
    .backface-hidden { backface-visibility: hidden; }
    .rotate-y-180 { transform: rotateY(180deg); }
    
    @keyframes pulse-match {
      0% { transform: rotateY(180deg) scale(1); }
      50% { transform: rotateY(180deg) scale(1.05); box-shadow: 0 0 20px currentColor; }
      100% { transform: rotateY(180deg) scale(1); }
    }
    
    .animate-pulse-match {
      animation: pulse-match 1.5s infinite;
    }

    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-up {
        animation: fadeIn 0.3s ease-out forwards;
    }
  `}</style>
);

// --- Utils ---
const getNeonColor = () => {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 100%, 60%)`;
};

// --- Main Component ---
const MemoryGame: React.FC = () => {
  const [phase, setPhase] = useState<'menu' | 'setup_custom' | 'preview_custom' | 'playing' | 'result' | 'review_pairs'>('menu');
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedIds, setFlippedIds] = useState<string[]>([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(0);
  const [customPairs, setCustomPairs] = useState([{ id: Date.now(), left: { type: 'text', content: '' }, right: { type: 'text', content: '' } }]);

  // Timer Ref
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      cards.forEach(card => {
        if (card.type === 'image') URL.revokeObjectURL(card.content);
      });
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Timer Logic
  useEffect(() => {
    if (phase === 'playing') {
      timerRef.current = setInterval(() => setTimer(prev => prev + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  // --- Handlers: Auto Mode ---
  const handleAutoMode = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = (Array.from(e.target.files) as File[]).filter(f => f.type.startsWith('image/'));
      if (files.length < 2) {
        alert("최소 2장의 이미지가 필요합니다.");
        return;
      }
      
      const selectedFiles = files.slice(0, 10); // Limit to 10 pairs (20 cards)
      const newCards: MemoryCard[] = [];

      selectedFiles.forEach((file, idx) => {
        const url = URL.createObjectURL(file);
        const pairColor = getNeonColor();
        const pairId = `pair-${idx}`;
        
        // Create two identical cards
        newCards.push({ id: `card-${idx}-1`, pairId, type: 'image', content: url, color: pairColor, isFlipped: false, isMatched: false });
        newCards.push({ id: `card-${idx}-2`, pairId, type: 'image', content: url, color: pairColor, isFlipped: false, isMatched: false });
      });

      startGame(newCards);
    }
  };

  // --- Handlers: Custom Mode ---
  const addCustomRow = () => {
    setCustomPairs([...customPairs, { id: Date.now(), left: { type: 'text', content: '' }, right: { type: 'text', content: '' } }]);
  };

  const removeCustomRow = (id: number) => {
    setCustomPairs(customPairs.filter(p => p.id !== id));
  };

  const updateCustomInput = (id: number, side: 'left' | 'right', type: 'text' | 'image', content: string) => {
    setCustomPairs(prev => prev.map(p => {
        if (p.id === id) {
            return { ...p, [side]: { type, content } };
        }
        return p;
    }));
  };

  const handleCustomFile = (e: React.ChangeEvent<HTMLInputElement>, id: number, side: 'left' | 'right') => {
      if (e.target.files && e.target.files[0]) {
          const url = URL.createObjectURL(e.target.files[0]);
          updateCustomInput(id, side, 'image', url);
      }
  };

  // Step 1: Validate and move to Preview
  const handleReviewCustomPairs = () => {
      const validPairs = customPairs.filter(p => p.left.content && p.right.content);
      if (validPairs.length < 2) {
          alert("최소 2세트 이상의 문제를 만들어주세요.");
          return;
      }
      setPhase('preview_custom');
  };

  // Step 2: Generate cards from Preview and Start
  const startCustomGame = () => {
      const validPairs = customPairs.filter(p => p.left.content && p.right.content);
      const newCards: MemoryCard[] = [];
      
      validPairs.forEach((pair, idx) => {
          const pairColor = getNeonColor();
          const pairId = `pair-${idx}`;

          newCards.push({ 
              id: `card-${idx}-L`, pairId, type: pair.left.type as 'text'|'image', content: pair.left.content, color: pairColor, isFlipped: false, isMatched: false 
          });
          newCards.push({ 
              id: `card-${idx}-R`, pairId, type: pair.right.type as 'text'|'image', content: pair.right.content, color: pairColor, isFlipped: false, isMatched: false 
          });
      });

      startGame(newCards);
  };

  // --- Game Logic ---
  const startGame = (deck: MemoryCard[]) => {
    // Shuffle
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setPhase('playing');
    setFlippedIds([]);
    setMatchedCount(0);
    setMoves(0);
    setTimer(0);
  };

  const handleCardClick = (id: string) => {
    // Lock if 2 cards already flipped or clicked card is already flipped/matched
    if (flippedIds.length >= 2) return;
    const clickedCard = cards.find(c => c.id === id);
    if (!clickedCard || clickedCard.isFlipped || clickedCard.isMatched) return;

    // Flip the card
    const newCards = cards.map(c => c.id === id ? { ...c, isFlipped: true } : c);
    setCards(newCards);
    
    const newFlippedIds = [...flippedIds, id];
    setFlippedIds(newFlippedIds);

    // Check match if 2 cards flipped
    if (newFlippedIds.length === 2) {
      setMoves(m => m + 1);
      const card1 = newCards.find(c => c.id === newFlippedIds[0])!;
      const card2 = newCards.find(c => c.id === newFlippedIds[1])!;

      if (card1.pairId === card2.pairId) {
        // Match Found
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            (c.id === card1.id || c.id === card2.id) 
              ? { ...c, isMatched: true } 
              : c
          ));
          setFlippedIds([]);
          setMatchedCount(prev => {
              const newCount = prev + 1;
              if (newCount === cards.length / 2) {
                  setTimeout(() => setPhase('result'), 1000);
              }
              return newCount;
          });
        }, 500);
      } else {
        // No Match
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            (c.id === card1.id || c.id === card2.id) 
              ? { ...c, isFlipped: false } 
              : c
          ));
          setFlippedIds([]);
        }, 1000);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Helper to extract pairs for review
  const getReviewPairs = () => {
    const grouped: Record<string, MemoryCard[]> = {};
    cards.forEach(card => {
        if (!grouped[card.pairId]) grouped[card.pairId] = [];
        grouped[card.pairId].push(card);
    });
    return Object.values(grouped);
  };

  // --- Render ---

  if (phase === 'menu') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 md:p-8 text-center animate-fade-in overflow-y-auto">
        <MemoryStyles />
        <div className="bg-slate-800/80 p-6 md:p-12 rounded-3xl border border-slate-700 shadow-2xl max-w-3xl w-full backdrop-blur-md my-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-2 text-white font-arcade">NEON MEMORY</h2>
            <p className="text-slate-400 mb-8 md:mb-12 text-sm md:text-base">수업 방식에 맞는 모드를 선택하세요.</p>

            <div className="flex flex-col md:flex-row gap-4 md:gap-6 justify-center items-center">
                {/* Auto Mode Button */}
                <div className="relative group w-full max-w-xs md:max-w-none md:w-auto">
                    <NeonButton 
                        variant="cyan" 
                        size="lg" 
                        className="w-full md:w-64 h-full flex flex-col items-center gap-3 md:gap-4 py-6 md:py-8 group-hover:bg-cyan-400 group-hover:text-slate-900 group-hover:shadow-[0_0_20px_rgba(34,211,238,0.6)]"
                    >
                        <Camera className="w-8 h-8 md:w-10 md:h-10" />
                        <div>
                            <div className="text-base md:text-lg font-bold">자동 복사 모드</div>
                            <div className="text-xs opacity-70 mt-1 font-normal tracking-normal text-slate-300 group-hover:text-slate-700">사진 1장 → 자동 2장</div>
                        </div>
                    </NeonButton>
                    <input 
                        type="file" 
                        multiple 
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        // Handle folder selection or multiple files
                        ref={(input) => {
                          if (input) {
                            input.setAttribute('webkitdirectory', '');
                            input.setAttribute('directory', '');
                          }
                        }}
                        onChange={handleAutoMode}
                    />
                </div>

                {/* Custom Mode Button */}
                <div className="w-full max-w-xs md:max-w-none md:w-auto">
                    <NeonButton 
                        variant="pink" 
                        size="lg" 
                        className="w-full md:w-64 h-full flex flex-col items-center gap-3 md:gap-4 py-6 md:py-8"
                        onClick={() => {
                            // Reset custom pairs if empty
                            if(customPairs.length === 0) addCustomRow();
                            setPhase('setup_custom');
                        }}
                    >
                        <Edit3 className="w-8 h-8 md:w-10 md:h-10" />
                        <div>
                            <div className="text-base md:text-lg font-bold">직접 짝짓기</div>
                            <div className="text-xs opacity-70 mt-1 font-normal tracking-normal text-slate-300">그림 ↔ 글자, 그림 ↔ 그림</div>
                        </div>
                    </NeonButton>
                </div>
            </div>
        </div>
      </div>
    );
  }

  if (phase === 'setup_custom') {
    return (
        <div className="flex flex-col h-full p-3 md:p-8 max-w-5xl mx-auto w-full">
            <h2 className="text-3xl font-bold text-pink-500 mb-2 drop-shadow-md text-center md:text-left">문제 만들기</h2>
            <p className="text-slate-400 mb-4 md:mb-6 text-sm text-center md:text-left break-keep">왼쪽과 오른쪽이 짝이 됩니다. 글자를 입력하거나 이미지를 선택하세요.</p>

            <div className="flex-1 overflow-y-auto pr-1 md:pr-2 space-y-4 mb-4 md:mb-6 custom-scrollbar">
                {customPairs.map((pair) => (
                    <div key={pair.id} className="relative flex flex-col md:flex-row items-center gap-3 md:gap-4 bg-slate-800/50 p-4 pt-10 md:p-4 rounded-xl border border-slate-700 animate-fade-in-up">
                        
                        {/* Mobile Delete Button (Top Right) */}
                        <button 
                            onClick={() => removeCustomRow(pair.id)} 
                            className="md:hidden absolute top-2 right-2 text-slate-500 hover:text-red-500 p-2 transition-colors z-10"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>

                        {/* Left Input Group */}
                        <div className="w-full md:flex-1 flex flex-col gap-2">
                            {/* Preview Box */}
                            <div className="relative h-16 bg-slate-900 rounded-lg overflow-hidden border border-slate-600 flex items-center justify-center">
                                {pair.left.type === 'image' ? (
                                    <img src={pair.left.content} className="h-full w-full object-contain" alt="Left" />
                                ) : (
                                    <span className="text-slate-500 text-xs">Card A</span>
                                )}
                            </div>
                            {/* Control Row */}
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    placeholder="글자 입력" 
                                    className="flex-1 bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:border-pink-500 outline-none min-w-0"
                                    value={pair.left.type === 'text' ? pair.left.content : ''}
                                    onChange={(e) => updateCustomInput(pair.id, 'left', 'text', e.target.value)}
                                    disabled={pair.left.type === 'image'}
                                />
                                <label className="cursor-pointer bg-slate-700 hover:bg-slate-600 p-2 rounded border border-slate-600 transition-colors shrink-0 flex items-center justify-center">
                                    <ImageIcon className="w-5 h-5 text-pink-400" />
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleCustomFile(e, pair.id, 'left')} />
                                </label>
                            </div>
                        </div>

                        {/* Separator (Rotate on Mobile) */}
                        <div className="text-slate-500 flex items-center justify-center shrink-0 py-1 md:py-0">
                             <ArrowRightLeft className="w-6 h-6 rotate-90 md:rotate-0" />
                        </div>

                        {/* Right Input Group */}
                        <div className="w-full md:flex-1 flex flex-col gap-2">
                             {/* Preview Box */}
                             <div className="relative h-16 bg-slate-900 rounded-lg overflow-hidden border border-slate-600 flex items-center justify-center">
                                {pair.right.type === 'image' ? (
                                    <img src={pair.right.content} className="h-full w-full object-contain" alt="Right" />
                                ) : (
                                    <span className="text-slate-500 text-xs">Card B</span>
                                )}
                            </div>
                            {/* Control Row */}
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    placeholder="글자 입력" 
                                    className="flex-1 bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:border-pink-500 outline-none min-w-0"
                                    value={pair.right.type === 'text' ? pair.right.content : ''}
                                    onChange={(e) => updateCustomInput(pair.id, 'right', 'text', e.target.value)}
                                    disabled={pair.right.type === 'image'}
                                />
                                <label className="cursor-pointer bg-slate-700 hover:bg-slate-600 p-2 rounded border border-slate-600 transition-colors shrink-0 flex items-center justify-center">
                                    <ImageIcon className="w-5 h-5 text-pink-400" />
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleCustomFile(e, pair.id, 'right')} />
                                </label>
                            </div>
                        </div>

                        {/* Desktop Delete Button */}
                        <button onClick={() => removeCustomRow(pair.id)} className="hidden md:block p-2 text-slate-500 hover:text-red-500 transition-colors shrink-0">
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                ))}
            </div>

            <div className="flex flex-col md:flex-row gap-3 md:gap-4 border-t border-slate-800 pt-4 md:pt-6">
                <button 
                    onClick={addCustomRow}
                    className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-3 md:px-6 md:py-3 bg-slate-800 hover:bg-slate-700 text-pink-500 font-bold rounded-lg border-2 border-slate-700 border-dashed transition-all whitespace-nowrap"
                >
                    <Plus className="w-5 h-5" /> 짝 추가하기
                </button>
                <div className="hidden md:block flex-1" />
                <div className="flex gap-2 w-full md:w-auto">
                    <button 
                        onClick={() => setPhase('menu')}
                        className="flex-1 md:flex-none px-4 py-3 md:px-6 md:py-3 text-slate-400 font-bold hover:text-white transition-colors text-center whitespace-nowrap"
                    >
                        취소
                    </button>
                    <NeonButton 
                        variant="pink" 
                        onClick={handleReviewCustomPairs}
                        className="flex-1 md:flex-none flex items-center justify-center whitespace-nowrap"
                    >
                        <Play className="w-5 h-5 inline-block mr-2" />
                        다음으로
                    </NeonButton>
                </div>
            </div>
        </div>
    );
  }

  // --- Preview Custom Pairs Phase (Before Start) ---
  if (phase === 'preview_custom') {
    return (
      <div className="flex flex-col h-full p-4 md:p-8 max-w-5xl mx-auto w-full animate-fade-in">
        <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-pink-500 mb-2 drop-shadow-md">짝 기억하기</h2>
            <p className="text-slate-400">게임이 시작되면 카드가 섞이고 뒤집힙니다. 짝을 잘 기억해두세요!</p>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 mb-6 custom-scrollbar">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {customPairs.filter(p => p.left.content && p.right.content).map((pair) => (
                    <div key={pair.id} className="bg-slate-800/80 border border-slate-600 p-4 rounded-xl flex items-center justify-between relative overflow-hidden group hover:border-pink-500/50 transition-colors">
                        <div className="absolute top-0 left-0 w-1 h-full bg-pink-500/50" />
                        
                        {/* Left Content */}
                        <div className="flex-1 flex justify-center items-center h-20 bg-black/30 rounded-lg p-2">
                             {pair.left.type === 'image' ? (
                                <img src={pair.left.content} className="h-full w-full object-contain" alt="Left" />
                             ) : (
                                <span className="font-bold text-white text-center break-keep leading-tight">{pair.left.content}</span>
                             )}
                        </div>

                        <div className="px-3 text-slate-500">
                            <ArrowRightLeft className="w-5 h-5" />
                        </div>

                        {/* Right Content */}
                        <div className="flex-1 flex justify-center items-center h-20 bg-black/30 rounded-lg p-2">
                             {pair.right.type === 'image' ? (
                                <img src={pair.right.content} className="h-full w-full object-contain" alt="Right" />
                             ) : (
                                <span className="font-bold text-white text-center break-keep leading-tight">{pair.right.content}</span>
                             )}
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="flex gap-4 border-t border-slate-800 pt-6 justify-center">
            <button 
                onClick={() => setPhase('setup_custom')}
                className="px-8 py-3 rounded-lg text-slate-400 font-bold hover:text-white hover:bg-slate-800 transition-colors"
            >
                다시 수정하기
            </button>
            <NeonButton variant="pink" size="lg" onClick={startCustomGame} className="animate-pulse">
                <Play className="w-5 h-5 inline-block mr-2" />
                게임 시작!
            </NeonButton>
        </div>
      </div>
    );
  }

  // --- Review Phase (After Clear) ---
  if (phase === 'review_pairs') {
    const pairs = getReviewPairs();
    return (
      <div className="flex flex-col h-full p-4 md:p-8 max-w-5xl mx-auto w-full animate-fade-in">
        <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-cyan-400 mb-2 drop-shadow-md font-arcade">REVIEW PAIRS</h2>
            <p className="text-slate-400">맞춘 짝들을 다시 한번 확인해보세요.</p>
        </div>

        {/* Padding moved inside to prevent clipping */}
        <div className="flex-1 overflow-y-auto mb-6 custom-scrollbar relative">
            <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {pairs.map((pair, idx) => (
                        <div 
                            key={idx} 
                            className="bg-slate-800/80 border-[3px] rounded-xl flex items-center justify-between relative gap-4 p-4"
                            style={{ 
                                borderColor: pair[0].color, 
                                boxShadow: `0 0 15px ${pair[0].color}` 
                            }}
                        >
                            {/* Card 1 */}
                            <div className="flex-1 flex justify-center items-center h-24 bg-black/40 rounded-lg p-2 border border-slate-700/50 min-w-0">
                                {pair[0].type === 'image' ? (
                                    <img src={pair[0].content} className="h-full w-full object-contain" alt="Left" />
                                ) : (
                                    <span className="font-bold text-white text-center break-keep leading-tight text-sm md:text-base">{pair[0].content}</span>
                                )}
                            </div>

                            <div className="shrink-0" style={{ color: pair[0].color }}>
                                <ArrowRightLeft className="w-5 h-5" />
                            </div>

                            {/* Card 2 */}
                            <div className="flex-1 flex justify-center items-center h-24 bg-black/40 rounded-lg p-2 border border-slate-700/50 min-w-0">
                                {pair[1].type === 'image' ? (
                                    <img src={pair[1].content} className="h-full w-full object-contain" alt="Right" />
                                ) : (
                                    <span className="font-bold text-white text-center break-keep leading-tight text-sm md:text-base">{pair[1].content}</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <div className="flex justify-center border-t border-slate-800 pt-6">
            <NeonButton variant="cyan" onClick={() => setPhase('result')}>
                <ArrowLeft className="w-5 h-5 inline-block mr-2" />
                결과 화면으로
            </NeonButton>
        </div>
      </div>
    );
  }

  if (phase === 'result') {
      return (
        <div className="flex flex-col items-center justify-center h-full animate-fade-in relative">
            <MemoryStyles />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-500/20 via-slate-900 to-slate-900 pointer-events-none" />
            
            <h1 className="text-6xl font-bold text-green-400 mb-8 font-arcade drop-shadow-[0_0_20px_rgba(74,222,128,0.6)] animate-pulse">
                CLEAR!
            </h1>

            <div className="bg-slate-800/80 p-10 rounded-2xl border border-slate-600 backdrop-blur-md flex gap-12 mb-12">
                <div className="text-center">
                    <div className="text-slate-400 text-sm mb-1 uppercase tracking-widest">Time</div>
                    <div className="text-4xl font-bold text-white">{formatTime(timer)}</div>
                </div>
                <div className="w-px bg-slate-600" />
                <div className="text-center">
                    <div className="text-slate-400 text-sm mb-1 uppercase tracking-widest">Moves</div>
                    <div className="text-4xl font-bold text-white">{moves}</div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <NeonButton variant="pink" size="lg" onClick={() => setPhase('review_pairs')}>
                    <Eye className="w-5 h-5 inline-block mr-2" />
                    짝 다시보기
                </NeonButton>
                <NeonButton variant="cyan" size="lg" onClick={() => setPhase('menu')}>
                    <RefreshCw className="w-5 h-5 inline-block mr-2" />
                    메인으로
                </NeonButton>
            </div>
        </div>
      );
  }

  // Phase: playing
  // Calculate grid columns based on card count
  const cardCount = cards.length;
  let gridCols = "grid-cols-4";
  if (cardCount <= 12) gridCols = "grid-cols-3 md:grid-cols-4";
  if (cardCount >= 20) gridCols = "grid-cols-4 md:grid-cols-5";

  return (
    <div className="flex flex-col h-full items-center p-4">
        <MemoryStyles />
        
        {/* Status Bar */}
        <div className="flex gap-8 mb-6 text-xl font-arcade bg-slate-900/50 px-8 py-3 rounded-full border border-slate-700/50 backdrop-blur-sm shrink-0">
            <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-400" />
                <span className="text-white w-16 tabular-nums">{formatTime(timer)}</span>
            </div>
            <div className="w-px bg-slate-700" />
            <div className="flex items-center gap-2">
                <Move className="w-5 h-5 text-purple-400" />
                <span className="text-white w-12 tabular-nums">{moves}</span>
            </div>
        </div>

        {/* Game Board */}
        <div className={`grid ${gridCols} gap-4 w-full max-w-5xl flex-1 overflow-y-auto p-4 min-h-0`}>
            {cards.map(card => (
                <div 
                    key={card.id} 
                    className={`relative w-full aspect-[3/4] cursor-pointer perspective-1000 group ${card.isMatched ? 'cursor-default' : ''}`}
                    onClick={() => handleCardClick(card.id)}
                >
                    <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${card.isFlipped || card.isMatched ? 'rotate-y-180' : ''}`}>
                        
                        {/* Front (Hidden state) */}
                        <div className="absolute inset-0 backface-hidden rounded-xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center shadow-lg group-hover:border-green-500/50 transition-colors">
                            <div className="text-slate-600 font-bold text-3xl opacity-20 select-none">?</div>
                            <div className="absolute inset-0 bg-[radial-gradient(circle,_#334155_10%,_transparent_11%)] bg-[length:10px_10px] opacity-20" />
                        </div>

                        {/* Back (Revealed state) */}
                        <div 
                            className={`absolute inset-0 backface-hidden rotate-y-180 rounded-xl overflow-hidden bg-black border-2 flex items-center justify-center p-2 shadow-[0_0_15px_rgba(0,0,0,0.5)] ${card.isMatched ? 'animate-pulse-match' : ''}`}
                            style={{ 
                                borderColor: card.isFlipped || card.isMatched ? card.color : '#334155',
                                boxShadow: (card.isFlipped || card.isMatched) ? `0 0 15px ${card.color}40` : 'none',
                                color: card.color
                            }}
                        >
                            {card.type === 'image' ? (
                                <img src={card.content} alt="card" className="w-full h-full object-contain pointer-events-none select-none" />
                            ) : (
                                <div className="text-center font-bold text-lg md:text-xl break-keep leading-tight select-none">
                                    {card.content}
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};

export default MemoryGame;