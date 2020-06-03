import { loadSTL } from '../../frontend/stlloader.js';

const cube = loadSTL('../../modeling/stl_models/cube.stl', [214, 48, 49]);

// ! DEBUG
console.log(cube);
