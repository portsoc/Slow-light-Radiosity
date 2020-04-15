import * as Rad from '../../radiosity/index.js';
import * as cube from '../cube.js';

export default function createRoom(subdivision = 2) {
  const cube1 = cube.unitCube(new Rad.Spectra(0.96, 0.92, 0.84), null, subdivision);
  const cube2 = cube.unitCubeMultiSurface(subdivision);

  cube2.surfaces[0].reflectance.add(new Rad.Spectra(0.7, 0.2, 0.2));
  cube2.surfaces[1].reflectance.add(new Rad.Spectra(0.7, 0.7, 0.2));
  cube2.surfaces[2].reflectance.add(new Rad.Spectra(0.2, 0.7, 0.2));
  cube2.surfaces[3].reflectance.add(new Rad.Spectra(0.2, 0.7, 0.7));
  cube2.surfaces[4].reflectance.add(new Rad.Spectra(0.2, 0.2, 0.7));
  cube2.surfaces[5].reflectance.add(new Rad.Spectra(0.7, 0.2, 0.7));

  const translation = new Rad.Vector3(1.5, 0.5, -0.5);
  for (const v of cube2.vertices) {
    v.pos.addVector(translation);
  }

  return new Rad.Environment([cube1, cube2]);
}
