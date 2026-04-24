import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { useStore } from '../../store';
import { audio } from '../../utils/audio';
import { MiniCube } from '../3D/MiniCube';

export const LearnTutorialOverlay = () => {
  const { tutorialSteps, currentStepIndex, nextStep, prevStep } = useStore();
  const currentStep = tutorialSteps[currentStepIndex];

  if (!currentStep) return null;

  return (
    <div className="absolute inset-0 pointer-events-none p-12 flex flex-col justify-end">
      
      {/* Top Center Progress Tracker */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className="font-mono-tech text-3xl text-orange-500 tracking-[0.3em] uppercase glow-orange">
              STEP {String(currentStepIndex + 1).padStart(2, '0')} / {String(tutorialSteps.length).padStart(2, '0')}
          </div>
          <div className="text-center font-mono-tech text-[10px] text-white/40 mt-1 uppercase tracking-widest">
              PHASE: {currentStep.phase}
          </div>
      </div>

      <div className="flex items-end justify-between w-full">
          
          {/* Left Panel: NEXT STEP PREVIEW */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="pointer-events-auto w-64 bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-lg overflow-hidden shadow-2xl"
          >
              <div className="p-3 border-b border-stone-800 flex justify-between items-center">
                  <span className="font-mono-tech text-[10px] text-orange-500 tracking-widest uppercase">NEXT_TARGET</span>
                  <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
              </div>
              
              <div className="h-40 w-full bg-black relative">
                  <Canvas camera={{ position: [6, 4.5, 9], fov: 40 }}>
                      <ambientLight intensity={1.5} />
                      <pointLight position={[10, 10, 10]} intensity={1} />
                      <MiniCube />
                  </Canvas>
              </div>

              <div className="p-4 border-t border-stone-800">
                  <div className="text-[10px] text-stone-500 mb-1 uppercase">SUGGESTED_MOVE</div>
                  <div className="font-tech text-sm font-bold text-white uppercase">
                      BACK CLOCKWISE
                  </div>
              </div>
          </motion.div>

          {/* Right Panel: DETAILED DESCRIPTION & ALGORITHM */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="pointer-events-auto w-[400px] bg-stone-900/90 backdrop-blur-md border border-stone-800 p-8 rounded-lg shadow-2xl flex flex-col gap-6"
          >
              <div className="flex flex-col gap-2">
                  <span className="font-mono-tech text-xs text-orange-500 tracking-widest uppercase">{currentStep.phase}</span>
                  <h2 className="font-tech text-2xl font-black text-white leading-tight uppercase">
                      {currentStep.phase}
                  </h2>
              </div>

              <p className="font-mono-tech text-xs text-stone-400 leading-relaxed border-l border-stone-800 pl-4">
                  {currentStep.description}
              </p>

              <div className="bg-black/60 border border-stone-800 p-6 rounded relative group overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
                  <span className="absolute top-2 right-3 font-mono-tech text-[8px] text-stone-600 tracking-widest">ALGORITHM_NOTATION</span>
                  <div className="font-tech text-3xl font-bold text-white tracking-[0.1em] break-words">
                      {currentStep.algorithm}
                  </div>
              </div>

              {/* Navigation Controls */}
              <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => { audio.click(); prevStep(); }}
                    disabled={currentStepIndex === 0}
                    className="bg-stone-800 hover:bg-stone-700 disabled:opacity-30 text-white font-tech font-bold py-3 rounded border border-stone-700 transition-all uppercase tracking-widest text-xs"
                  >
                      PREVIOUS
                  </button>
                  <button 
                    onClick={() => { audio.click(); nextStep(); }}
                    disabled={currentStepIndex === tutorialSteps.length - 1}
                    className="bg-orange-600 hover:bg-orange-500 disabled:opacity-30 text-white font-tech font-bold py-3 rounded border border-orange-400/30 transition-all uppercase tracking-widest text-xs"
                  >
                      NEXT_STEP
                  </button>
              </div>

              <div className="flex gap-2">
                  <button className="flex-1 bg-white/5 hover:bg-white/10 text-stone-400 text-[10px] font-mono-tech py-2 rounded border border-stone-800 transition-all uppercase">
                      ANIMATE_SEQUENCE
                  </button>
                  <button className="flex-1 bg-white/5 hover:bg-white/10 text-stone-400 text-[10px] font-mono-tech py-2 rounded border border-stone-800 transition-all uppercase">
                      AUTO_PLAY
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