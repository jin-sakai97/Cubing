import { create } from 'zustand';

export type GameMode = 'HERO' | 'GAME' | 'LEARN';
export type LearnPhase = 'INPUT' | 'TUTORIAL';
export type ThemeType = 'TECH' | 'DEV' | 'NEON' | 'ANIME' | 'SKETCH';

export interface Move {
    axis: string;
    slice: number;
    dir: number;
}

export interface TutorialStep {
    phase: string;
    description: string;
    algorithm: string;
}

export interface SelectedColor {
    key: 'f' | 'r' | 'u' | 'd' | 'l' | 'b';
    hex: string;
    color: string;
    name: string;
}

interface AppState {
  mode: GameMode;
  theme: ThemeType;
  isSolved: boolean;
  orbitEnabled: boolean;
  
  // Timer State
  gameStartTime: number | null;
  gameEndTime: number | null;
  isTimerRunning: boolean;

  // Snapshot
  solvedSnapshot: string | null;

  // Solver State
  currentHint: string | null;
  moveHistory: Move[];

  // View Sync
  cameraQuaternion: number[] | null;

  // Learn Mode State
  learnPhase: LearnPhase;
  tutorialSteps: TutorialStep[];
  currentPhaseIndex: number;
  currentMoveIndex: number; // Index within the current phase's algorithm
  cubeStateString: string | null;

  // Painting State
  selectedColor: SelectedColor | null;
  paintedStickers: Record<string, string>; // "pieceId-face" -> hex
  colorCounts: Record<string, number>;

  setMode: (mode: GameMode) => void;
  setTheme: (theme: ThemeType) => void;
  setIsSolved: (solved: boolean) => void;
  setOrbitEnabled: (enabled: boolean) => void;
  setSolvedSnapshot: (url: string | null) => void;
  setCurrentHint: (hint: string | null) => void;
  setCameraQuaternion: (quat: number[]) => void;
  
  // Learn Mode Actions
  setLearnPhase: (phase: LearnPhase) => void;
  setTutorialSteps: (steps: TutorialStep[]) => void;
  setCurrentPhaseIndex: (index: number) => void;
  setCurrentMoveIndex: (index: number) => void;
  setCubeStateString: (state: string | null) => void;
  
  // Granular Navigation
  nextTutorialMove: () => void;
  prevTutorialMove: () => void;

  // Painting Actions
  setSelectedColor: (color: SelectedColor | null) => void;
  paintSticker: (pieceId: number, face: string, colorHex: string, colorKey: string) => void;
  initializePaintingState: () => void;
  resetPainting: () => void;

  // History Actions
  pushMove: (move: Move) => void;
  popMove: () => void;
  resetMoves: () => void;

  startGame: () => void;
  stopGame: () => void;
  resetGame: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  mode: 'HERO',
  theme: 'TECH',
  isSolved: false,
  orbitEnabled: true,
  
  gameStartTime: null,
  gameEndTime: null,
  isTimerRunning: false,
  solvedSnapshot: null,
  currentHint: null,
  moveHistory: [],
  cameraQuaternion: null,

  // Learn Mode Initial State
  learnPhase: 'INPUT',
  tutorialSteps: [],
  currentPhaseIndex: 0,
  currentMoveIndex: -1, // -1 means no move highlighted yet (start of phase)
  cubeStateString: null,

  // Painting Initial State
  selectedColor: null,
  paintedStickers: {},
  colorCounts: { f: 0, r: 0, u: 0, d: 0, l: 0, b: 0 }, 

  setMode: (mode) => set({ mode }),
  setTheme: (theme) => set({ theme }),
  setIsSolved: (isSolved) => set({ isSolved }),
  setOrbitEnabled: (orbitEnabled) => set({ orbitEnabled }),
  setSolvedSnapshot: (solvedSnapshot) => set({ solvedSnapshot }),
  setCurrentHint: (currentHint) => set({ currentHint }),
  setCameraQuaternion: (cameraQuaternion) => set({ cameraQuaternion }),
  
  // Learn Mode Setters
  setLearnPhase: (learnPhase) => set({ learnPhase }),
  setTutorialSteps: (tutorialSteps) => set({ 
      tutorialSteps, 
      currentPhaseIndex: 0, 
      currentMoveIndex: -1 
  }),
  setCurrentPhaseIndex: (currentPhaseIndex) => set({ currentPhaseIndex, currentMoveIndex: -1 }),
  setCurrentMoveIndex: (currentMoveIndex) => set({ currentMoveIndex }),
  setCubeStateString: (cubeStateString) => set({ cubeStateString }),

  nextTutorialMove: () => set((state) => {
      const currentPhase = state.tutorialSteps[state.currentPhaseIndex];
      if (!currentPhase) return {};
      
      const moves = currentPhase.algorithm.split(' ').filter(m => m.length > 0);
      
      if (state.currentMoveIndex < moves.length - 1) {
          return { currentMoveIndex: state.currentMoveIndex + 1 };
      } else if (state.currentPhaseIndex < state.tutorialSteps.length - 1) {
          return { 
              currentPhaseIndex: state.currentPhaseIndex + 1,
              currentMoveIndex: 0
          };
      }
      return {};
  }),

  prevTutorialMove: () => set((state) => {
      if (state.currentMoveIndex > 0) {
          return { currentMoveIndex: state.currentMoveIndex - 1 };
      } else if (state.currentPhaseIndex > 0) {
          const prevPhase = state.tutorialSteps[state.currentPhaseIndex - 1];
          const prevMoves = prevPhase.algorithm.split(' ').filter(m => m.length > 0);
          return {
              currentPhaseIndex: state.currentPhaseIndex - 1,
              currentMoveIndex: prevMoves.length - 1
          };
      } else if (state.currentMoveIndex === 0) {
          return { currentMoveIndex: -1 };
      }
      return {};
  }),

  // Painting Setters
  setSelectedColor: (selectedColor) => set({ selectedColor }),
  initializePaintingState: () => set(() => {
      // Centers identified by position in INITIAL_POSITIONS
      // Using standard BOY scheme: White-Up, Yellow-Down, Green-Front, Blue-Back, Red-Right, Orange-Left
      // Indices (frozen INITIAL_POSITIONS):
      // 14: (0,0,1) -> Front -> Green (#009E60)
      // 12: (0,0,-1) -> Back -> Blue (#0051BA)
      // 16: (0,1,0) -> Up -> White (#FFFFFF)
      // 10: (0,-1,0) -> Down -> Yellow (#FFD500)
      // 22: (1,0,0) -> Right -> Red (#C41E3A)
      // 4: (-1,0,0) -> Left -> Orange (#FF5800)
      
      const paintedStickers: Record<string, string> = {
          '14-front': '#009E60',
          '12-back': '#0051BA',
          '16-up': '#FFFFFF',
          '10-down': '#FFD500',
          '22-right': '#C41E3A',
          '4-left': '#FF5800',
      };
      const colorCounts = { f: 1, r: 1, u: 1, d: 1, l: 1, b: 1 };
      return { paintedStickers, colorCounts, selectedColor: null };
  }),
  paintSticker: (pieceId, face, colorHex, colorKey) => set((state) => {
      const key = `${pieceId}-${face}`;
      const oldHex = state.paintedStickers[key];
      
      if (oldHex === colorHex) return {};

      // Don't allow painting over centers
      if ([14, 12, 16, 10, 22, 4].includes(pieceId)) {
          const centerFaces: Record<number, string> = {
              14: 'front', 12: 'back', 16: 'up', 10: 'down', 22: 'right', 4: 'left'
          };
          if (centerFaces[pieceId] === face) return {};
      }

      const hexToKey: Record<string, string> = {
          '#009E60': 'f', '#C41E3A': 'r', '#FFFFFF': 'u', 
          '#FFD500': 'd', '#FF5800': 'l', '#0051BA': 'b'
      };
      
      const newCounts = { ...state.colorCounts };
      if (oldHex) {
          const oldKey = hexToKey[oldHex];
          if (oldKey) newCounts[oldKey]--;
      }
      
      newCounts[colorKey]++;
      return {
          paintedStickers: { ...state.paintedStickers, [key]: colorHex },
          colorCounts: newCounts
      };
  }),
  resetPainting: () => set((state) => {
      const paintedStickers: Record<string, string> = {
          '14-front': '#009E60',
          '12-back': '#0051BA',
          '16-up': '#FFFFFF',
          '10-down': '#FFD500',
          '22-right': '#C41E3A',
          '4-left': '#FF5800',
      };
      const colorCounts = { f: 1, r: 1, u: 1, d: 1, l: 1, b: 1 };
      return { paintedStickers, colorCounts, selectedColor: null };
  }),

  pushMove: (move) => set((state) => ({ moveHistory: [...state.moveHistory, move] })),
  popMove: () => set((state) => {
      const newHistory = [...state.moveHistory];
      newHistory.pop();
      return { moveHistory: newHistory };
  }),
  resetMoves: () => set({ moveHistory: [] }),

  startGame: () => set((state) => {
    if (state.isTimerRunning) return {}; 
    return { isTimerRunning: true, gameStartTime: Date.now(), gameEndTime: null, isSolved: false, solvedSnapshot: null, currentHint: null };
  }),
  stopGame: () => set((state) => {
      if (!state.isTimerRunning) return {};
      return { isTimerRunning: false, gameEndTime: Date.now(), isSolved: true };
  }),
  resetGame: () => set({ 
      isTimerRunning: false, 
      gameStartTime: null, 
      gameEndTime: null, 
      isSolved: false, 
      solvedSnapshot: null, 
      currentHint: null,
      moveHistory: [],
      cameraQuaternion: null
  }),
}));