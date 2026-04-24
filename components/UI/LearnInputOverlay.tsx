import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore, SelectedColor } from '../../store';
import { audio } from '../../utils/audio';
import { generateTutorialSteps } from '../../utils/beginnerSolver';
import { getMappingFromNet, FaceName } from '../../utils/netMapping';
import { getCubeStateFromPainting } from '../../utils/cubeState';

const PALETTE: SelectedColor[] = [
    { name: 'FRONT', color: '#009E60', hex: '#009E60', key: 'f' },
    { name: 'RIGHT', color: '#C41E3A', hex: '#C41E3A', key: 'r' },
    { name: 'UP', color: '#FFFFFF', hex: '#FFFFFF', key: 'u' },
    { name: 'DOWN', color: '#FFD500', hex: '#FFD500', key: 'd' },
    { name: 'LEFT', color: '#FF5800', hex: '#FF5800', key: 'l' },
    { name: 'BACK', color: '#0051BA', hex: '#0051BA', key: 'b' }
];

const GUIDED_SEQUENCE: FaceName[] = ['front', 'right', 'back', 'left', 'up', 'down'];

export const LearnInputOverlay = () => {
  const { 
      setLearnPhase, 
      setTutorialSteps, 
      selectedColor, 
      setSelectedColor, 
      colorCounts,
      resetPainting,
      paintedStickers,
      paintSticker
  } = useStore();
  
  const [error, setError] = useState<string | null>(null);
  const [currentFaceIndex, setCurrentFaceIndex] = useState(0);

  // Sync 3D camera with current guided face
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('rotateToFace', { 
      detail: { face: GUIDED_SEQUENCE[currentFaceIndex] } 
    }));
  }, [currentFaceIndex]);

  const handleReset = () => {
    audio.click();
    resetPainting();
    setCurrentFaceIndex(0);
    setError(null);
    window.dispatchEvent(new CustomEvent('rotateToFace', { detail: { face: 'front' } }));
  };

  const handleValidate = () => {
      audio.click();
      const allComplete = Object.values(colorCounts).every(c => c === 9);
      
      if (!allComplete) {
          const missing = Object.entries(colorCounts)
            .filter(([_, count]) => count < 9)
            .map(([key, count]) => `${key.toUpperCase()}: ${9 - count} left`)
            .join(', ');
          setError(`INCOMPLETE: ${missing}`);
          return;
      }

      const cubeState = getCubeStateFromPainting(paintedStickers);
      const steps = generateTutorialSteps(cubeState);
      
      if (steps.length === 0) {
          setError("INVALID_CONFIG: THIS CUBE STATE IS PHYSICALLY IMPOSSIBLE");
          return;
      }

      // Special case: Cube is already solved
      if (steps.length === 1 && steps[0].phase === 'SOLVED') {
          setError("ALREADY_SOLVED: YOUR CUBE IS PERFECT! SCRAMBLE IT TO SEE THE TUTORIAL.");
          // We still allow them to proceed if they want to see the "Solved" screen
          setTutorialSteps(steps);
          setLearnPhase('TUTORIAL');
          return;
      }

      setTutorialSteps(steps);
      setLearnPhase('TUTORIAL');
  };


  const renderFace = (face: FaceName) => {
    const grid = [];
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            const { pieceId, face: faceKey } = getMappingFromNet(face, row, col);
            const stickerKey = `${pieceId}-${faceKey}`;
            const color = paintedStickers[stickerKey] || '#404040';
            const isCenter = row === 1 && col === 1;

            grid.push(
                <button
                    key={`${face}-${row}-${col}`}
                    onClick={() => {
                        if (isCenter || !selectedColor) return;
                        paintSticker(pieceId, faceKey, selectedColor.hex, selectedColor.key);
                        audio.click();
                    }}
                    className={`w-full aspect-square border border-stone-800/50 transition-all ${isCenter ? 'cursor-default' : 'hover:bg-white/10 active:scale-95 shadow-sm'}`}
                    style={{ backgroundColor: color }}
                />
            );
        }
    }
    return (
        <div className={`grid grid-cols-3 gap-0.5 p-1 bg-stone-900/80 rounded-sm border-2 transition-all ${GUIDED_SEQUENCE[currentFaceIndex] === face ? 'border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.4)]' : 'border-stone-800'}`}>
            {grid}
        </div>
    );
};

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-12">
      
      {/* 2D NET UI */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="pointer-events-auto flex flex-col items-center gap-6 mb-8"
      >
          {/* THE NET CROSS */}
          <div className="grid grid-cols-4 grid-rows-3 gap-4">
              {/* Row 1: UP */}
              <div className="col-start-2 row-start-1">
                  {renderFace('up')}
                  <div className="text-center font-mono-tech text-[8px] text-stone-500 mt-1 uppercase">UP (WHITE)</div>
              </div>

              {/* Row 2: LEFT, FRONT, RIGHT, BACK */}
              <div className="row-start-2">
                  {renderFace('left')}
                  <div className="text-center font-mono-tech text-[8px] text-stone-500 mt-1 uppercase">LEFT</div>
              </div>
              <div className="row-start-2">
                  {renderFace('front')}
                  <div className="text-center font-mono-tech text-[8px] text-stone-500 mt-1 uppercase">FRONT</div>
              </div>
              <div className="row-start-2">
                  {renderFace('right')}
                  <div className="text-center font-mono-tech text-[8px] text-stone-500 mt-1 uppercase">RIGHT</div>
              </div>
              <div className="row-start-2">
                  {renderFace('back')}
                  <div className="text-center font-mono-tech text-[8px] text-stone-500 mt-1 uppercase">BACK</div>
              </div>

              {/* Row 3: DOWN */}
              <div className="col-start-2 row-start-3">
                  {renderFace('down')}
                  <div className="text-center font-mono-tech text-[8px] text-stone-500 mt-1 uppercase">DOWN (YELLOW)</div>
              </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-4">
              <button 
                onClick={() => setCurrentFaceIndex(prev => Math.max(0, prev - 1))}
                disabled={currentFaceIndex === 0}
                className="px-6 py-2 bg-stone-800 hover:bg-stone-700 disabled:opacity-30 rounded border border-stone-700 font-tech font-bold text-white transition-all uppercase tracking-widest text-xs"
              >
                  PREV FACE
              </button>
              <div className="w-32 text-center font-tech font-bold text-orange-500 uppercase tracking-widest text-sm">
                  {GUIDED_SEQUENCE[currentFaceIndex]}
              </div>
              <button 
                onClick={() => setCurrentFaceIndex(prev => Math.min(GUIDED_SEQUENCE.length - 1, prev + 1))}
                disabled={currentFaceIndex === GUIDED_SEQUENCE.length - 1}
                className="px-6 py-2 bg-stone-800 hover:bg-stone-700 disabled:opacity-30 rounded border border-stone-700 font-tech font-bold text-white transition-all uppercase tracking-widest text-xs"
              >
                  NEXT FACE
              </button>
          </div>
      </motion.div>

      {/* Side Panels (Overlayed) */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-between p-12">
          {/* Left: Palette */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="pointer-events-auto w-56 bg-stone-900/90 backdrop-blur-md border border-stone-800 p-5 rounded-lg flex flex-col gap-4 shadow-2xl"
          >
            <div className="flex justify-between items-center border-b border-stone-800 pb-2">
                <h3 className="font-mono-tech text-[10px] text-orange-500 tracking-[0.2em]">PALETTE</h3>
                <button 
                    onClick={handleReset}
                    className="text-[8px] font-mono-tech text-stone-500 hover:text-white transition-colors"
                >
                    RESET_ALL
                </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
                {PALETTE.map((p) => {
                    const filled = colorCounts[p.key] || 0;
                    const remaining = 9 - filled;
                    const isSelected = selectedColor?.key === p.key;
                    const isComplete = remaining === 0;

                    return (
                        <button
                            key={p.key}
                            onClick={() => { setSelectedColor(p); audio.click(); }}
                            disabled={isComplete}
                            className={`
                                h-10 rounded border transition-all flex flex-col items-center justify-center font-tech
                                ${isSelected ? 'border-white scale-105 shadow-lg ring-1 ring-white/50' : 'border-stone-700'}
                                ${isComplete ? 'opacity-30 grayscale cursor-not-allowed' : 'opacity-80 hover:opacity-100'}
                            `}
                            style={{ backgroundColor: p.hex, color: p.key === 'u' ? 'black' : 'white' }}
                        >
                            <span className="text-[9px] leading-none mb-1">{p.name}</span>
                            <span className="text-[7px] opacity-70 leading-none">
                                {isComplete ? 'DONE' : `${remaining} LEFT`}
                            </span>
                        </button>
                    );
                })}
            </div>
          </motion.div>

          {/* Right: Actions */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="pointer-events-auto w-56 flex flex-col gap-6"
          >
            <div className="bg-stone-900/90 backdrop-blur-md border border-stone-800 p-5 rounded-lg shadow-2xl">
                <h3 className="font-mono-tech text-[10px] text-orange-500 tracking-[0.2em] border-b border-stone-800 pb-2 mb-3 uppercase">STATUS</h3>
                {error ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }} 
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-red-950/80 border border-red-500 p-2 rounded text-[8px] font-mono-tech text-red-200 leading-tight"
                    >
                        {error}
                    </motion.div>
                ) : (
                    <div className="font-mono-tech text-[8px] text-stone-500 uppercase leading-relaxed">
                        // ALL_SENSORS_ACTIVE <br/>
                        // {Object.values(colorCounts).reduce((a,b) => a+b, 0)}/54 FILLED
                    </div>
                )}
            </div>

            <button 
                onClick={handleValidate}
                className="bg-orange-600 hover:bg-orange-500 text-white font-tech font-bold py-3 rounded tracking-widest shadow-lg shadow-orange-900/20 transition-all border border-orange-400/30 uppercase text-xs"
            >
                VALIDATE
            </button>
          </motion.div>
      </div>

    </div>
  );
};