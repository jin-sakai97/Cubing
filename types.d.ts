declare module 'rubiks-cube-solver' {
    function solver(cubeState: string, options?: { partitioned?: boolean }): any;
    export default solver;
}
