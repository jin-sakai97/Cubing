import solver from 'rubiks-cube-solver';

export interface TutorialStep {
    phase: string;
    description: string;
    algorithm: string;
}

/**
 * Generates educational tutorial steps using the rubiks-cube-solver.
 * The solver returns partitioned steps (Cross, F2L, OLL, PLL).
 */
export const generateTutorialSteps = (cubeState: string): TutorialStep[] => {
    try {
        // rubiks-cube-solver outputs partitions when options are passed
        const options = { partitioned: true };
        const rawSolution = (solver as any)(cubeState, options);

        if (!rawSolution) return [];

        const steps: TutorialStep[] = [];

        // Helper to flatten moves into a string
        const formatMoves = (moves: string | string[]): string => {
            if (Array.isArray(moves)) {
                return moves.filter(m => m && m.trim().length > 0).join(' ');
            }
            return moves || '';
        };

        const crossAlgo = formatMoves(rawSolution.cross);
        if (crossAlgo) {
            steps.push({
                phase: 'WHITE CROSS',
                description: 'Build a white cross on the bottom face by matching the edge pieces with their respective centers.',
                algorithm: crossAlgo
            });
        }

        const f2lAlgo = formatMoves(rawSolution.f2l);
        if (f2lAlgo) {
            steps.push({
                phase: 'FIRST TWO LAYERS (F2L)',
                description: 'Solve the first two layers by pairing corner and edge pieces and inserting them into their slots.',
                algorithm: f2lAlgo
            });
        }

        const ollAlgo = formatMoves(rawSolution.oll);
        if (ollAlgo) {
            steps.push({
                phase: 'ORIENT LAST LAYER (OLL)',
                description: 'Orient all stickers on the top face to be yellow.',
                algorithm: ollAlgo
            });
        }

        const pllAlgo = formatMoves(rawSolution.pll);
        if (pllAlgo) {
            steps.push({
                phase: 'PERMUTE LAST LAYER (PLL)',
                description: 'Permute the top layer pieces to their final positions while keeping them oriented.',
                algorithm: pllAlgo
            });
        }

        // If the cube is already solved, return a single "SOLVED" step
        if (steps.length === 0) {
            steps.push({
                phase: 'SOLVED',
                description: 'The cube is already solved! You can explore the tutorial steps if you scramble it again.',
                algorithm: ''
            });
        }

        return steps;

    } catch (e) {
        console.error("Solver Error:", e);
        return [];
    }
};
