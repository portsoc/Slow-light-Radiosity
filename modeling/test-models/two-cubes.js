/* istanbul ignore file */ // don't report as not covered by tests, we test these visually

import * as Rad from '../../radiosity/index.js';
import Transform3 from '../transform3.js';
import * as Cube from '../cube.js';

export function createTwoCubes(subdivision = 2) {
  const c1 = cube1(subdivision);
  const c2 = cube2(subdivision);

  return new Rad.Environment([c1, c2]);
}

export function createTwoCubesInRoom(subdivision = 2) {
  const c1 = cube1(subdivision);
  const c2 = cube2(subdivision);
  const r = room(subdivision * 2);

  return new Rad.Environment([c1, c2, r]);
}

function cube1(subdivision) {
  return Cube.unitCube(new Rad.Spectra(0.12, 0.81, 0.21), null, subdivision);
}

function cube2(subdivision) {
  const retval = Cube.unitCubeMultiSurface(subdivision);

  retval.surfaces[0].reflectance.add(new Rad.Spectra(0.7, 0.2, 0.2));
  retval.surfaces[1].reflectance.add(new Rad.Spectra(0.7, 0.7, 0.2));
  retval.surfaces[2].reflectance.add(new Rad.Spectra(0.2, 0.7, 0.2));
  retval.surfaces[3].reflectance.add(new Rad.Spectra(0.2, 0.7, 0.7));
  retval.surfaces[4].reflectance.add(new Rad.Spectra(0.2, 0.2, 0.7));
  retval.surfaces[5].reflectance.add(new Rad.Spectra(0.7, 0.2, 0.7));

  const translation = new Transform3().translate(1.5, 0.5, -0.5);

  translation.transform(retval);

  return retval;
}

function room(subdivision) {
  const retval = Cube.unitCubeMultiSurface(subdivision);

  retval.surfaces[0].reflectance.add(new Rad.Spectra(0.9, 0.8, 0.7));
  retval.surfaces[1].reflectance.add(new Rad.Spectra(0.8, 0.8, 0.7));
  retval.surfaces[2].reflectance.add(new Rad.Spectra(0.9, 0.7, 0.7));
  retval.surfaces[3].reflectance.add(new Rad.Spectra(0.8, 0.7, 0.9));
  retval.surfaces[4].reflectance.add(new Rad.Spectra(0.7, 0.8, 0.8));
  retval.surfaces[5].reflectance.add(new Rad.Spectra(0.7, 0.9, 0.8));

  const roomXform = new Transform3();
  roomXform.scale(5, 5, -4);
  roomXform.translate(-1, -1, 3);
  roomXform.transform(retval);

  return retval;
}
