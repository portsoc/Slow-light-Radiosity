/* istanbul ignore file */ // don't report as not covered by tests, we test these visually

import * as Rad from '../../radiosity/index.js';
import Transform3 from '../transform3.js';
import * as Cube from '../cube.js';
import * as Cylinder from '../cylinder.js';

export function createTwoCubes(subdivision = 2) {
  const c1 = cube1(subdivision);
  const c2 = cube2(subdivision);

  return new Rad.Environment([c1, c2]);
}

export function createTwoCubesInRoom(subdivision = 2, subPatches) {
  const c1 = cube1(subdivision, subPatches);
  const c2 = cube2(subdivision, subPatches);
  const r = room(subdivision * 2, subPatches);

  return new Rad.Environment([c1, c2, r]);
}

export function createCubeAndLampInRoom(subdivision = 2, subPatches) {
  const c1 = lamp1(subdivision);
  const c2 = cube2(subdivision, subPatches, 1);
  const r = room(subdivision * 2, subPatches);

  return new Rad.Environment([c1, c2, r]);
}

function lamp1(subdivision) {
  const L = 1.6;
  const retval = Cylinder.lampshade(6 * subdivision, 0.7, 0.4, 1, subdivision);
  retval.surfaces[1].emittance.add(new Rad.Spectra(L, L, L));
  retval.surfaces[0].emittance.add(new Rad.Spectra(L / 2, L / 2, L / 2));
  retval.surfaces[0].reflectance.add(new Rad.Spectra(0.8, 0.8, 0.8));
  retval.surfaces[1].reflectance.add(new Rad.Spectra(0.8, 0.8, 0.8));
  return retval;
}

function cube1(subdivision, subPatches) {
  return Cube.unitCube(new Rad.Spectra(0.12, 0.81, 0.21), null, subdivision, subPatches);
}

// L is light intensity
function cube2(subdivision, subPatches, L = 10) {
  const retval = Cube.unitCubeMultiSurface(subdivision, subPatches);

  retval.surfaces[0].reflectance.add(new Rad.Spectra(0.7, 0.2, 0.2));
  retval.surfaces[1].reflectance.add(new Rad.Spectra(0.7, 0.7, 0.2));
  retval.surfaces[2].reflectance.add(new Rad.Spectra(0.8, 0.8, 0.8));
  retval.surfaces[2].emittance.add(new Rad.Spectra(L, L, L));
  retval.surfaces[3].reflectance.add(new Rad.Spectra(0.2, 0.7, 0.7));
  retval.surfaces[4].reflectance.add(new Rad.Spectra(0.2, 0.2, 0.7));
  retval.surfaces[5].reflectance.add(new Rad.Spectra(0.7, 0.2, 0.7));

  const translation = new Transform3().translate(1.5, 0.5, -0.5);

  translation.transform(retval);

  return retval;
}

function room(subdivision, subPatches) {
  const retval = Cube.unitCubeMultiSurface(subdivision, subPatches);

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
