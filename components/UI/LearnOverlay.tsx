import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store';
import { audio } from '../../utils/audio';
import { LearnInputOverlay } from './LearnInputOverlay';
import { LearnTutorialOverlay } from './LearnTutorialOverlay';

export const LearnOverlay = () => {
  const { mode, setMode, learnPhase, setLearnPhase, resetGame } = useStore();

  const handleExit = () => {
      audio.click();
      resetGame();
      setMode('HERO');
      setLearnPhase('INPUT');
  }

  return (
    <AnimatePresence>
      {mode === 'LEARN' && (
        <div className="absolute inset-0 pointer-events-none z-20">
          
          {/* Top Bar (Universal for Learn Mode) */}
          <motion.div 
            className="absolute top-0 left-0 right-0 p-8 flex justify-between items-center border-b border-stone-800/50 bg-gradient-to-b from-stone-950/80 to-transparent"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
             <div className="font-mono-tech text-stone-500 text-xs uppercase">
                MODE: LEARNING_MODULE <br />
                PHASE: {learnPhase}
             </div>

             <button
                onClick={handleExit}
                onMouseEnter={() => audio.hover()}
                className="pointer-events-auto bg-stone-900/90 hover:bg-red-900/80 text-stone-300 hover:text-white border border-stone-700 hover:border-red-500 px-6 py-2 rounded font-tech font-bold transition-all flex items-center gap-2 group"
             >
                <span className="w-2 h-2 bg-red-500 rounded-full group-hover:animate-ping"></span>
                EXIT
             </button>
          </motion.div>

          <div className="relative w-full h-full">
              {learnPhase === 'INPUT' ? (
                  <LearnInputOverlay />
              ) : (
                  <LearnTutorialOverlay />
              )}
          </div>

        </div>
      )}
    </AnimatePresence>
  );
};