/**
 * Maps a 2D net coordinate (face, row, col) to a 3D piece ID.
 * pieceId = (x+1)*9 + (y+1)*3 + (z+1)
 * row: 0-2 (top-to-bottom)
 * col: 0-2 (left-to-right)
 */

export type FaceName = 'front' | 'back' | 'up' | 'down' | 'left' | 'right';

export interface MappingResult {
    pieceId: number;
    face: FaceName;
}

export const getMappingFromNet = (face: FaceName, row: number, col: number): MappingResult => {
    let x = 0, y = 0, z = 0;

    switch (face) {
        case 'up':
            y = 1;
            z = -1 + row;
            x = -1 + col;
            break;
        case 'down':
            y = -1;
            z = 1 - row;
            x = -1 + col;
            break;
        case 'front':
            z = 1;
            y = 1 - row;
            x = -1 + col;
            break;
        case 'back':
            z = -1;
            y = 1 - row;
            x = 1 - col;
            break;
        case 'left':
            x = -1;
            y = 1 - row;
            z = -1 + col;
            break;
        case 'right':
            x = 1;
            y = 1 - row;
            z = 1 - col;
            break;
    }

    const pieceId = (x + 1) * 9 + (y + 1) * 3 + (z + 1);
    return { pieceId, face };
};
