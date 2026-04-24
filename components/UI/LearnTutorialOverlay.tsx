import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { useStore } from '../../store';
import { audio } from '../../utils/audio';
import { MiniCube } from '../3D/MiniCube';

export const LearnTutorialOverlay = () => {
  const { 
    tutorialSteps, 
    currentPhaseIndex, 
    currentMoveIndex, 
    nextTutorialMove, 
    prevTutorialMove 
  } = useStore();
  
  const currentPhase = tutorialSteps[currentPhaseIndex];

  const moves = useMemo(() => {
      if (!currentPhase) return [];
      return currentPhase.algorithm.split(' ').filter(m => m.length > 0);
  }, [currentPhase]);

  if (!currentPhase) return null;

  const currentMove = moves[currentMoveIndex];

  return (
    <div className="absolute inset-0 pointer-events-none p-12 flex flex-col justify-end">
      
      {/* Top Center Progress Tracker */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 pointer-events-none text-center">
          <div className="font-mono-tech text-3xl text-orange-500 tracking-[0.3em] uppercase glow-orange">
              PHASE {String(currentPhaseIndex + 1).padStart(2, '0')} / {String(tutorialSteps.length).padStart(2, '0')}
          </div>
          <div className="font-mono-tech text-[10px] text-white/40 mt-1 uppercase tracking-widest">
              {currentPhase.phase}
          </div>
          {moves.length > 0 && (
            <div className="font-mono-tech text-[12px] text-orange-400 mt-2 uppercase tracking-[0.2em]">
                MOVE {currentMoveIndex + 1} OF {moves.length}
            </div>
          )}
      </div>

      <div className="flex items-end justify-between w-full">
          
          {/* Left Panel: NEXT STEP PREVIEW */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="pointer-events-auto w-64 bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-lg overflow-hidden shadow-2xl"
          >
              <div className="p-3 border-b border-stone-800 flex justify-between items-center">
                  <span className="font-mono-tech text-[10px] text-orange-500 tracking-widest uppercase">3D_PREVIEW</span>
                  <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
              </div>
              
              <div className="h-40 w-full bg-black relative">
                  <Canvas camera={{ position: [6, 4.5, 9], fov: 40 }}>
                      <ambientLight intensity={1.5} />
                      <pointLight position={[10, 10, 10]} intensity={1} />
                      <MiniCube />
                  </Canvas>
              </div>

              <div className="p-4 border-t border-stone-800 bg-black/20">
                  <div className="text-[10px] text-stone-500 mb-1 uppercase">CURRENT_NOTATION</div>
                  <div className="font-tech text-xl font-bold text-orange-500 uppercase tracking-widest">
                      {currentMove || '---'}
                  </div>
              </div>
          </motion.div>

          {/* Right Panel: DETAILED DESCRIPTION & ALGORITHM */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="pointer-events-auto w-[450px] bg-stone-900/90 backdrop-blur-md border border-stone-800 p-8 rounded-lg shadow-2xl flex flex-col gap-6"
          >
              <div className="flex flex-col gap-1">
                  <span className="font-mono-tech text-[10px] text-orange-500 tracking-[0.2em] uppercase">INSTRUCTIONS</span>
                  <h2 className="font-tech text-xl font-black text-white leading-tight uppercase">
                      {currentPhase.phase}
                  </h2>
              </div>

              <p className="font-mono-tech text-[10px] text-stone-400 leading-relaxed border-l-2 border-orange-500/30 pl-4 py-1">
                  {currentPhase.description}
              </p>

              <div className="bg-black/60 border border-stone-800 p-6 rounded relative group overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
                  <span className="absolute top-2 right-3 font-mono-tech text-[8px] text-stone-600 tracking-widest">ALGORITHM_SEQUENCE</span>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                      {moves.length > 0 ? moves.map((m, idx) => (
                          <div 
                            key={idx}
                            className={`
                                px-3 py-1 rounded font-tech text-2xl transition-all duration-300
                                ${idx === currentMoveIndex ? 'bg-orange-600 text-white scale-110 shadow-[0_0_15px_rgba(249,115,22,0.5)]' : 
                                  idx < currentMoveIndex ? 'text-white/40' : 'text-stone-600'}
                            `}
                          >
                              {m}
                          </div>
                      )) : (
                          <div className="font-tech text-2xl text-orange-500 tracking-widest italic">SOLVED</div>
                      )}
                  </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => { audio.click(); prevTutorialMove(); }}
                        disabled={currentPhaseIndex === 0 && currentMoveIndex <= 0}
                        className="bg-stone-800 hover:bg-stone-700 disabled:opacity-20 text-white font-tech font-bold py-3 rounded border border-stone-700 transition-all uppercase tracking-widest text-xs"
                      >
                          PREVIOUS
                      </button>
                      <button 
                        onClick={() => { audio.click(); nextTutorialMove(); }}
                        disabled={currentPhaseIndex === tutorialSteps.length - 1 && currentMoveIndex === moves.length - 1}
                        className="bg-orange-600 hover:bg-orange-500 disabled:opacity-20 text-white font-tech font-bold py-3 rounded border border-orange-400/30 transition-all uppercase tracking-widest text-xs shadow-lg shadow-orange-900/20"
                      >
                          {currentMoveIndex === moves.length - 1 ? 'NEXT PHASE' : 'NEXT MOVE'}
                      </button>
                  </div>
                  
                  <button 
                    onClick={() => { audio.click(); useStore.getState().setLearnPhase('INPUT'); }}
                    className="w-full bg-white/5 hover:bg-white/10 text-stone-500 text-[8px] font-mono-tech py-2 rounded border border-stone-800 transition-all uppercase tracking-[0.3em]"
                  >
                      RETURN_TO_INPUT_PHASE
                  </button>
              </div>

          </motion.div>

      </div>
      
      <style>{`
          .glow-orange {
              text-shadow: 0 0 20px rgba(249, 115, 22, 0.4);
          }
      `}</style>

    </div>
  );
};