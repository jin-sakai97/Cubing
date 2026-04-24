/**
 * 4-Look Last Layer (4LLL) Solver Logic
 * Breaks down OLL and PLL into 4 beginner-friendly steps.
 */

export interface FourLookSolution {
    oll1: { algo: string; name: string };
    oll2: { algo: string; name: string };
    pll1: { algo: string; name: string };
    pll2: { algo: string; name: string };
}

/**
 * 54-char string format: Front(0-8), Right(9-17), Up(18-26), Down(27-35), Left(36-44), Back(45-53)
 */

const getUpFace = (state: string) => state.substring(18, 27);
const getSideStickers = (state: string) => {
    // Top row of side faces
    return {
        f: state.substring(0, 3),
        r: state.substring(9, 12),
        l: state.substring(36, 39),
        b: state.substring(45, 48),
    };
};

/**
 * Rotate a 3x3 face representation (9 chars) clockwise
 */
const rotateFace = (face: string) => {
    return face[6] + face[3] + face[0] +
           face[7] + face[4] + face[1] +
           face[8] + face[5] + face[2];
};

/**
 * Rotate the entire top layer clockwise (equivalent to a U move)
 * This affects the Up face and the top stickers of side faces.
 */
const rotateTopLayer = (state: string) => {
    const up = getUpFace(state);
    const newUp = rotateFace(up);
    
    const f = state.substring(0, 3);
    const r = state.substring(9, 12);
    const l = state.substring(36, 39);
    const b = state.substring(45, 48);

    let newState = state.split('');
    // Up face
    for(let i=0; i<9; i++) newState[18+i] = newUp[i];
    // Side faces: F -> L, R -> F, B -> R, L -> B
    for(let i=0; i<3; i++) {
        newState[36+i] = f[i];
        newState[0+i] = r[i];
        newState[45+i] = l[i];
        newState[9+i] = b[i];
    }
    return newState.join('');
};

/**
 * 2-Look OLL Step 1: Orient Edges (Yellow Cross)
 */
const solveOLLEdges = (state: string): { algo: string; name: string; newState: string } => {
    const up = getUpFace(state);
    const center = up[4];
    const isOriented = (idx: number) => up[idx] === center;

    for (let i = 0; i < 4; i++) {
        const u = getUpFace(state);
        const top = isOriented(1);
        const right = isOriented(5);
        const bottom = isOriented(7);
        const left = isOriented(3);

        if (top && right && bottom && left) return { algo: '', name: 'SOLVED', newState: state };
        
        // Line case
        if (left && right && !top && !bottom) {
             return { algo: "F R U R' U' F'", name: "LINE", newState: state };
        }
        // L-Shape case (top and left)
        if (top && left && !right && !bottom) {
             return { algo: "f R U R' U' f'", name: "L-SHAPE", newState: state };
        }
        // Dot case (only center oriented)
        if (!top && !right && !bottom && !left) {
             return { algo: "F R U R' U' F' f R U R' U' f'", name: "DOT", newState: state };
        }

        state = rotateTopLayer(state);
    }
    return { algo: '', name: 'UNKNOWN', newState: state };
};

/**
 * 2-Look OLL Step 2: Orient Corners (Full Yellow Face)
 * Assumes edges are already oriented.
 */
const solveOLLCorners = (state: string): { algo: string; name: string; newState: string } => {
    const up = getUpFace(state);
    const center = up[4];
    const oriented = [0, 2, 6, 8].filter(idx => up[idx] === center);

    for (let i = 0; i < 4; i++) {
        const u = getUpFace(state);
        const sides = getSideStickers(state);
        // up indices for corners: 0(tl), 2(tr), 8(br), 6(bl)
        // side indices: f[0,2], r[0,2], l[0,2], b[0,2]

        if (oriented.length === 4) return { algo: '', name: 'SOLVED', newState: state };

        if (oriented.length === 1) {
            // Sune or Anti-Sune
            if (u[6] === center) { // Corner at bottom-left oriented
                if (state[0] === center) return { algo: "R U R' U R U2 R'", name: "SUNE", newState: state };
            }
            if (u[2] === center) { // Corner at top-right oriented
                if (state[0] === center) return { algo: "R U2 R' U' R U' R'", name: "ANTI-SUNE", newState: state };
            }
        }
        
        if (oriented.length === 0) {
            // H or Pi
            if (state[9] === center && state[11] === center && state[36] === center && state[38] === center) {
                return { algo: "F (R U R' U')3 F'", name: "H", newState: state };
            }
            if (u[4] === center && state[36] === center && state[38] === center && state[0] === center && state[47] === center) {
                 // Pi pattern detection is complex, simplified for now
                 return { algo: "R U2 R2 U' R2 U' R2 U2 R", name: "PI", newState: state };
            }
        }

        if (oriented.length === 2) {
            // T, U, or L
            if (state[0] === center && state[2] === center) return { algo: "R2 D R' U2 R D' R' U2 R'", name: "U (HEADLIGHTS)", newState: state };
            if (state[9] === center && state[11] === center) return { algo: "r U R' U' r' F R F'", name: "T", newState: state };
            if (u[2] === center && u[6] === center) return { algo: "F' r U R' U' r' F R", name: "L (BOWTIE)", newState: state };
        }

        state = rotateTopLayer(state);
    }

    // Fallback: If we can't detect, we return a standard Sune to change the state
    return { algo: "R U R' U R U2 R'", name: "OLL-SCRAMBLE", newState: state };
};

/**
 * 2-Look PLL Step 1: Corner Permutation
 */
const solvePLLCorners = (state: string): { algo: string; name: string; newState: string } => {
    for (let i = 0; i < 4; i++) {
        const sides = getSideStickers(state);
        
        // Check for headlights on Left face (Back side of the layer)
        // Actually standard 2-look PLL says headlights on left for T-perm
        if (sides.l[0] === sides.l[2]) {
             // Are all corners solved?
             if (sides.f[0] === sides.f[2] && sides.r[0] === sides.r[2] && sides.b[0] === sides.b[2]) {
                 return { algo: '', name: 'SOLVED', newState: state };
             }
             return { algo: "R U R' U' R' F R2 U' R' U' R U R' F'", name: "T-PERM (CORNERS)", newState: state };
        }
        state = rotateTopLayer(state);
    }
    // No headlights found
    return { algo: "F R U' R' U' R U R' F' R U R' U' R' F R F'", name: "Y-PERM (NO HEADLIGHTS)", newState: state };
};

/**
 * 2-Look PLL Step 2: Edge Permutation
 */
const solvePLLEdges = (state: string): { algo: string; name: string; newState: string } => {
    for (let i = 0; i < 4; i++) {
        const sides = getSideStickers(state);
        const isSolved = (side: string) => side[0] === side[1] && side[1] === side[2];
        
        const solvedSides = [isSolved(sides.f), isSolved(sides.r), isSolved(sides.b), isSolved(sides.l)].filter(v => v).length;

        if (solvedSides === 4) return { algo: '', name: 'SOLVED', newState: state };

        if (solvedSides === 1) {
            // Solve back face
            if (isSolved(sides.b)) {
                // Ua or Ub
                if (sides.f[1] === sides.r[0]) return { algo: "M2 U M U2 M' U M2", name: "UA-PERM", newState: state };
                return { algo: "M2 U' M U2 M' U' M2", name: "UB-PERM", newState: state };
            }
        }

        if (solvedSides === 0) {
            // H or Z
            if (sides.f[1] === sides.b[0]) return { algo: "M2 U M2 U2 M2 U M2", name: "H-PERM", newState: state };
            return { algo: "M' U M2 U M2 U M' U2 M2", name: "Z-PERM", newState: state };
        }

        state = rotateTopLayer(state);
    }
    return { algo: "M2 U M U2 M' U M2", name: "PLL-SCRAMBLE", newState: state };
};

export const getFourLookSolution = (state: string): FourLookSolution => {
    const res1 = solveOLLEdges(state);
    const res2 = solveOLLCorners(res1.newState);
    const res3 = solvePLLCorners(res2.newState);
    const res4 = solvePLLEdges(res3.newState);

    return {
        oll1: { algo: res1.algo, name: res1.name },
        oll2: { algo: res2.algo, name: res2.name },
        pll1: { algo: res3.algo, name: res3.name },
        pll2: { algo: res4.algo, name: res4.name },
    };
};
