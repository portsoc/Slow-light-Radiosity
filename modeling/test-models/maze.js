import { loadSTL } from '../../frontend/stlloader.js';
import * as Rad from '../../radiosity/index.js';
import Transform3 from '../transform3.js';
import * as Cube from '../cube.js';

export default async function createMaze() {
  const maze = await loadSTL('../modeling/stl-models/15x15-maze.stl', [241, 242, 246]);
  const light1 = makeLightCube([87, 75, 144]);
  const light2 = makeLightCube([225, 95, 65]);
  const light3 = makeLightCube([61, 193, 211]);

  const mx = new Transform3();
  mx.rotateX(90);
  mx.scale(0.1, 0.1, 0.1);
  mx.transform(maze);

  const l1x = new Transform3();
  l1x.rotateX(90);
  l1x.scale(0.3, 0.3, 0.3);
  l1x.translate(2, 0, 2.7);
  l1x.transform(light1);

  const l2x = new Transform3();
  l2x.rotateX(90);
  l2x.scale(0.3, 0.3, 0.3);
  l2x.translate(9.3, 0, 15.8);
  l2x.transform(light2);

  const l3x = new Transform3();
  l3x.rotateX(90);
  l3x.scale(0.3, 0.3, 0.3);
  l3x.translate(11.9, 0, 6);
  l3x.transform(light3);

  return new Rad.Environment([light3, light2, light1, maze]);
}

function makeLightCube(colour) {
  const c = colour.map(x => x / 255);
  const s = 2;

  const retval = Cube.unitCubeMultiSurface([5, 5, 5], true);

  // sides
  retval.surfaces[0].emittance.add(new Rad.Spectra(c[0], c[1], c[2])); // front
  retval.surfaces[1].emittance.add(new Rad.Spectra(c[0], c[1], c[2])); // back
  retval.surfaces[2].emittance.add(new Rad.Spectra(c[0], c[1], c[2])); // right
  retval.surfaces[3].emittance.add(new Rad.Spectra(c[0], c[1], c[2])); // left
  retval.surfaces[4].emittance.add(new Rad.Spectra(c[0], c[1], c[2])); // top
  retval.surfaces[5].emittance.add(new Rad.Spectra(c[0], c[1], c[2])); // bottom

  const lcx = new Transform3();
  lcx.scale(s, s, s);
  lcx.transform(retval);

  return retval;
}
