import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useStore } from '../../store';
import { generateDevTexture, generateAnimeTexture, generateClassicSticker, generateSketchTexture, generateNeonTunnelTexture, generateNeonCoreTexture } from '../../utils/textureGen';

interface CubePieceProps {
  initialColors: { [key: string]: string };
  id: number;
  paintedColors?: { [key: string]: string };
}

const CubePiece: React.FC<CubePieceProps> = ({ initialColors, id, paintedColors }) => {
  const theme = useStore((state) => state.theme);
  const learnPhase = useStore((state) => state.learnPhase);
  const mode = useStore((state) => state.mode);

  // Create materials array only when theme changes or painting occurs
  const materials = useMemo(() => {
     // Order MUST match BoxGeometry face order: Right(x+), Left(x-), Top(y+), Bottom(y-), Front(z+), Back(z-)
     const faces = ['right', 'left', 'up', 'down', 'front', 'back'];

     return faces.map((face, index) => {
         const paintedHex = paintedColors?.[face];
         const initialHex = initialColors[face];
         const isVisibleFace = initialHex !== '#000000';
         
         let color: string;
         if (mode === 'LEARN' && learnPhase === 'INPUT') {
             if (isVisibleFace) {
                 color = paintedHex || '#404040';
             } else {
                 color = '#000000';
             }
         } else {
             color = initialHex;
         }
         
         const isCore = color === '#000000' || color === '#404040'; 

         // --- NEON / HOLO THEME (TUNNEL EFFECT) ---
         if (theme === 'NEON') {
             if (isCore) {
                const coreTex = generateNeonCoreTexture();
                return new THREE.MeshStandardMaterial({
                    map: coreTex,
                    color: '#000000',
                    roughness: 0.1,
                    metalness: 0.8,
                });
             }
             const texture = generateNeonTunnelTexture(color);
             const threeColor = new THREE.Color(color);
             const mat = new THREE.MeshStandardMaterial({
                 map: texture,
                 color: '#000000', 
                 emissive: threeColor, 
                 emissiveMap: texture,
                 emissiveIntensity: 4.0,
                 roughness: 0.2,
                 metalness: 0.8,
             });
             mat.userData = { isNeon: true }; 
             return mat;
         }

         // --- ANIME THEME ---
         if (theme === 'ANIME') {
             if (isCore) return new THREE.MeshStandardMaterial({ color: '#000', roughness: 0.1, metalness: 0.8 });
             const texture = generateAnimeTexture(color, id, index);
             return new THREE.MeshStandardMaterial({ map: texture, roughness: 0.4, metalness: 0.1, emissive: color, emissiveIntensity: 0.2 });
         }

         // --- DEV THEME ---
         if (theme === 'DEV') {
             if (isCore) return new THREE.MeshPhysicalMaterial({ color: '#050505', roughness: 0.2, metalness: 0.1, clearcoat: 1.0 });
             const texture = generateDevTexture(color, id, index);
             return new THREE.MeshPhysicalMaterial({ map: texture, color: '#ffffff', roughness: 0.3, metalness: 0.0, clearcoat: 0.5, envMapIntensity: 1.2 });
        }

        // --- SKETCH THEME ---
        if (theme === 'SKETCH') {
            if (isCore) {
                const texture = generateSketchTexture('#111111'); 
                return new THREE.MeshStandardMaterial({
                    map: texture,
                    color: '#ffffff',
                    roughness: 1.0,
                    metalness: 0.0,
                });
            }
            const texture = generateSketchTexture(color); 
            return new THREE.MeshStandardMaterial({
                map: texture,
                color: '#ffffff',
                roughness: 0.9,   
                metalness: 0.0,
            });
        }

        // --- TECH / CLASSIC ---
        if (isCore) {
             return new THREE.MeshStandardMaterial({
                 color: '#000000',
                 roughness: 0.5, 
                 metalness: 0.0,
             });
        }
        const texture = generateClassicSticker(color);
        return new THREE.MeshStandardMaterial({
            map: texture,
            color: '#ffffff',
            roughness: 0.2,
            metalness: 0.1,
        });
     });
  }, [theme, initialColors, id, paintedColors, mode, learnPhase]);

  // Pulse animation for NEON theme
  useFrame((state) => {
    if (theme === 'NEON') {
        const time = state.clock.elapsedTime;
        const pulse = 3.5 + Math.sin(time * 2.0) * 1.5; 
        materials.forEach(m => {
            if (m.userData?.isNeon) {
                // @ts-ignore
                m.emissiveIntensity = pulse;
            }
        });
    }
  });

  return (
    <mesh material={materials}>
        <boxGeometry args={[0.96, 0.96, 0.96]} />
    </mesh>
  );
};

export default React.memo(CubePiece);