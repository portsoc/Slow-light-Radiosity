import * as Rad from '../../radiosity/index.js';
import Transform3 from '../transform3.js';
import * as Cube from '../cube.js';

export default function createRoom(subdivision = 2) {
  const cube1 = Cube.unitCube(new Rad.Spectra(0.12, 0.81, 0.21), null, subdivision);
  const cube2 = Cube.unitCubeMultiSurface(subdivision);

  cube2.surfaces[0].reflectance.add(new Rad.Spectra(0.7, 0.2, 0.2));
  cube2.surfaces[1].reflectance.add(new Rad.Spectra(0.7, 0.7, 0.2));
  cube2.surfaces[2].reflectance.add(new Rad.Spectra(0.2, 0.7, 0.2));
  cube2.surfaces[3].reflectance.add(new Rad.Spectra(0.2, 0.7, 0.7));
  cube2.surfaces[4].reflectance.add(new Rad.Spectra(0.2, 0.2, 0.7));
  cube2.surfaces[5].reflectance.add(new Rad.Spectra(0.7, 0.2, 0.7));

  const translation = new Transform3().translate(1.5, 0.5, -0.5);

  translation.transform(cube2);

  return new Rad.Environment([cube1, cube2]);
}
