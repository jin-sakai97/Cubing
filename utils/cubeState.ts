import * as THREE from 'three';
import { FaceName, getMappingFromNet } from './netMapping';

/**
 * Maps the 3D cube pieces to a 54-character string representation.
 * Standard format for solvers: Front, Right, Up, Down, Left, Back (FRU D L B)
 * Each face has 9 stickers in reading order (top-left to bottom-right).
 * 
 * Sticker Mapping (Index 0-53):
 * 0-8: Front
 * 9-17: Right
 * 18-26: Up
 * 27-35: Down
 * 36-44: Left
 * 45-53: Back
 */

const FACE_ORDER = ['front', 'right', 'up', 'down', 'left', 'back'];

export const getCubeStateString = (pieces: any[]) => {
    // 1. Define face normals in world space
    const normals = {
        front: new THREE.Vector3(0, 0, 1),
        right: new THREE.Vector3(1, 0, 0),
        up: new THREE.Vector3(0, 1, 0),
        down: new THREE.Vector3(0, -1, 0),
        left: new THREE.Vector3(-1, 0, 0),
        back: new THREE.Vector3(0, 0, -1)
    };

    const state: string[] = new Array(54).fill(' ');

    // 2. Map color to letter (case insensitive for this solver usually)
    // Front: 'f', Right: 'r', Up: 'u', Down: 'd', Left: 'l', Back: 'b'
    // Based on center pieces which define the face
    const colorToFace: Record<string, string> = {};
    
    // Find center pieces to define which color is which face
    pieces.forEach(p => {
        const pos = p.currentPos;
        // Center piece check (only one non-zero coordinate)
        const nonZero = [pos.x, pos.y, pos.z].filter(v => Math.abs(v) > 0.1).length;
        if (nonZero === 1) {
            // This is a center piece. Check which face it is on.
            if (Math.abs(pos.z - 1) < 0.1) colorToFace[p.colors.front] = 'f';
            if (Math.abs(pos.x - 1) < 0.1) colorToFace[p.colors.right] = 'r';
            if (Math.abs(pos.y - 1) < 0.1) colorToFace[p.colors.up] = 'u';
            if (Math.abs(pos.y + 1) < 0.1) colorToFace[p.colors.down] = 'd';
            if (Math.abs(pos.x + 1) < 0.1) colorToFace[p.colors.left] = 'l';
            if (Math.abs(pos.z + 1) < 0.1) colorToFace[p.colors.back] = 'b';
        }
    });

    // 3. For each face, find the 9 stickers and sort them in reading order
    FACE_ORDER.forEach((faceName, faceIdx) => {
        const normal = (normals as any)[faceName];
        
        // Find pieces on this face
        const facePieces = pieces.filter(p => {
            if (faceName === 'front' || faceName === 'back') return Math.abs(p.currentPos.z - normal.z) < 0.1;
            if (faceName === 'right' || faceName === 'left') return Math.abs(p.currentPos.x - normal.x) < 0.1;
            if (faceName === 'up' || faceName === 'down') return Math.abs(p.currentPos.y - normal.y) < 0.1;
            return false;
        });

        // Sort stickers in reading order for that face
        // Front (Z=1): Y desc, X asc
        // Right (X=1): Y desc, Z desc
        // Up (Y=1): Z desc, X asc
        // Down (Y=-1): Z asc, X asc
        // Left (X=-1): Y desc, Z asc
        // Back (Z=-1): Y desc, X desc
        
        facePieces.sort((a, b) => {
            const pa = a.currentPos;
            const pb = b.currentPos;
            if (faceName === 'front') return pb.y - pa.y || pa.x - pb.x;
            if (faceName === 'right') return pb.y - pa.y || pb.z - pa.z;
            if (faceName === 'up') return pb.z - pa.z || pa.x - pb.x;
            if (faceName === 'down') return pa.z - pb.z || pa.x - pb.x;
            if (faceName === 'left') return pb.y - pa.y || pa.z - pb.z;
            if (faceName === 'back') return pb.y - pa.y || pb.x - pa.x;
            return 0;
        });

        facePieces.forEach((p, i) => {
            const color = p.colors[faceName];
            state[faceIdx * 9 + i] = colorToFace[color] || '?';
        });
    });

    return state.join('');
};

/**
 * Generates a 54-character cube state string from the paintedStickers record in the store.
 * The order is FRU D L B, 9 stickers each.
 */
export const getCubeStateFromPainting = (paintedStickers: Record<string, string>) => {
    const state: string[] = new Array(54).fill('?');

    // Mapping of hex colors to face keys
    const hexToKey: Record<string, string> = {
        '#009E60': 'f', // Green
        '#C41E3A': 'r', // Red
        '#FFFFFF': 'u', // White
        '#FFD500': 'd', // Yellow
        '#FF5800': 'l', // Orange
        '#0051BA': 'b', // Blue
    };

    const faces: FaceName[] = ['front', 'right', 'up', 'down', 'left', 'back'];

    faces.forEach((faceName, faceIdx) => {
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                const { pieceId, face: faceKey } = getMappingFromNet(faceName, row, col);
                const colorHex = paintedStickers[`${pieceId}-${faceKey}`];
                const letter = hexToKey[colorHex] || '?';
                state[faceIdx * 9 + (row * 3 + col)] = letter;
            }
        }
    });

    return state.join('');
};
