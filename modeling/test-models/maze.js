import { loadSTL } from '../stl-loader.js';
import * as Rad from '../../radiosity/index.js';
import Transform3 from '../transform3.js';
import * as Cube from '../cube.js';

export default async function createMaze() {
  const mazeColor = new Rad.Spectra(241, 242, 246).scale(1 / 255);
  const maze = await loadSTL('../modeling/stl-models/15x15-maze.stl', mazeColor);

  const light1 = makeLightCube(new Rad.Spectra(87, 75, 144).scale(1 / 255));
  const light2 = makeLightCube(new Rad.Spectra(225, 95, 65).scale(1 / 255));
  const light3 = makeLightCube(new Rad.Spectra(61, 193, 211).scale(1 / 255));

  const l1x = new Transform3();
  l1x.scale(6, 6, 6);
  l1x.translate(20, 27, 0);
  l1x.transform(light1);

  const l2x = new Transform3();
  l2x.scale(6, 6, 6);
  l2x.translate(93, 158, 0);
  l2x.transform(light2);

  const l3x = new Transform3();
  l3x.scale(6);
  l3x.translate(119, 60, 0);
  l3x.transform(light3);

  return new Rad.Environment([light3, light2, light1, maze]);
}

function makeLightCube(color) {
  const L = 10;
  const emittance = new Rad.Spectra(color).scale(L);

  return Cube.unitCube(color, emittance);
}
