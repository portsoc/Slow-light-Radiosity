import { loadSTL } from '../../frontend/stlloader.js';
import * as Rad from '../../radiosity/index.js';
import Transform3 from '../transform3.js';
import * as Cube from '../cube.js';

export default async function createOpticalCubes() {
  const diggedCube = await loadSTL('../modeling/stl-models/Optical_Illusion_Cube.stl', [45, 152, 218]);
  const spiralCube = await loadSTL('../modeling/stl-models/spiral_cube_cube.stl', [32, 191, 107]);
  const room = makeRoom(20);
  const light = makeLight();

  const dcx = new Transform3();
  dcx.scale(0.15, 0.15, 0.15);
  dcx.translate(5, 5, 0);
  dcx.transform(diggedCube);

  const scx = new Transform3();
  scx.scale(0.13, 0.13, 0.13);
  scx.translate(11, 5, 0);
  scx.transform(spiralCube);

  const lx = new Transform3();
  lx.rotateZ(90);
  lx.translate(12, 4.5, 8);
  lx.transform(light);


  return new Rad.Environment([light, room, spiralCube, diggedCube]);
}

function makeRoom(subdivision = 5) {
  const x = 16;
  const y = 10;
  const z = 10;

  const retval = Cube.unitCubeMultiSurface(subdivision);

  // The sides are in order of front (standing on x), back, right, left, top, bottom.
  retval.surfaces[0].reflectance.add(new Rad.Spectra(0.8, 0.8, 0.8)); // front
  retval.surfaces[1].reflectance.add(new Rad.Spectra(0.8, 0.8, 0.8)); // back
  retval.surfaces[2].reflectance.add(new Rad.Spectra(0.8, 0.8, 0.8)); // right
  retval.surfaces[3].reflectance.add(new Rad.Spectra(0.95, 0.0, 0.0)); // left
  retval.surfaces[4].reflectance.add(new Rad.Spectra(0.2, 0.3, 0.3)); // top (floor due to inversion scaling)
  retval.surfaces[5].reflectance.add(new Rad.Spectra(0.95, 0.95, 0.95)); // bottom (ceiling due to inv.scaling)

  const roomXform = new Transform3();
  roomXform.scale(x, y, -z);
  roomXform.translate(0, 0, z);
  roomXform.transform(retval);

  return retval;
}

function makeLight() {
  const x = 0.5;
  const y = 8;
  const z = 0.2;

  // lightness
  const L = 10;

  const retval = Cube.unitCubeMultiSurface([1, 5, 1], true);

  // The sides are in order of front (standing on x), back, right, left, top, bottom.
  retval.surfaces[0].reflectance.add(new Rad.Spectra(0.0, 0.0, 0.5)); // front
  retval.surfaces[1].reflectance.add(new Rad.Spectra(0.0, 0.0, 0.5)); // back
  retval.surfaces[2].reflectance.add(new Rad.Spectra(0.0, 0.0, 0.5)); // right
  retval.surfaces[3].reflectance.add(new Rad.Spectra(0.0, 0.0, 0.5)); // left
  retval.surfaces[4].reflectance.add(new Rad.Spectra(0.8, 0.8, 0.8)); // top
  retval.surfaces[5].reflectance.add(new Rad.Spectra(0.8, 0.8, 0.8)); // bottom
  retval.surfaces[4].emittance.add(new Rad.Spectra(L * 0.5, L * 0.5, L * 0.5)); // top
  retval.surfaces[5].emittance.add(new Rad.Spectra(L, L, L)); // bottom

  const roomXform = new Transform3();
  roomXform.scale(x, y, z);
  roomXform.transform(retval);

  return retval;
}
