/// <reference types="vite/client" />
/// <reference types="@react-three/fiber" />

import * as THREE from 'three'
import * as React from 'react'

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        mesh: any;
        group: any;
        boxGeometry: any;
        meshStandardMaterial: any;
        ambientLight: any;
        pointLight: any;
        directionalLight: any;
        spotLight: any;
        orthographicCamera: any;
        instancedMesh: any;
        dodecahedronGeometry: any;
        boxBufferGeometry: any;
        meshPhysicalMaterial: any;
        meshPhongMaterial: any;
        sphereGeometry: any;
        planeGeometry: any;
        torusGeometry: any;
        canvasTexture: any;
      }
    }
  }
}

declare module 'rubiks-cube-solver' {
    function solver(cubeState: string, options?: { partitioned?: boolean }): any;
    export default solver;
}

import 'framer-motion';

declare module 'framer-motion' {
  export interface MotionProps {
    className?: string;
    onMouseEnter?: any;
    onMouseLeave?: any;
    onClick?: any;
  }
}
