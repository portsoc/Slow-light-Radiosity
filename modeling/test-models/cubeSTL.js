import { loadSTL } from '../../frontend/stlloader.js';

const cube = loadSTL('../modeling/stl-models/cube.stl', [214, 48, 49]);

cube.then(console.log);
