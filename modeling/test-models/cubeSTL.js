import { loadSTL } from '../../frontend/stlloader.js';
import * as Rad from '../../radiosity/index.js';

export default async function createCubeStl() {
  const cube = await loadSTL('../modeling/stl-models/cube.stl', [214, 48, 49]);
  return new Rad.Environment([cube]);
}
