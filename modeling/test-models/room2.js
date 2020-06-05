/* istanbul ignore file */ // don't report as not covered by tests, we test these visually

import * as Rad from '../../radiosity/index.js';
import Transform3 from '../transform3.js';
import * as Cube from '../cube.js';

// create a long room with a single light near one end
export default function createRoom() {
  const room = makeRoom([40, 3, 3]);
  const light = makeLight();

  const lx = new Transform3();
  lx.translate(4, 4, 4);
  lx.transform(light);

  return new Rad.Environment([light, room]);
}

function makeRoom(subdivision) {
  const x = 30;
  const y = 8;
  const z = 8;

  const retval = Cube.unitCube(new Rad.Spectra(0.9, 0.9, 0.9), null, subdivision, true);

  const roomXform = new Transform3();
  roomXform.scale(x, y, -z);
  roomXform.translate(0, 0, z);
  roomXform.transform(retval);

  return retval;
}

function makeLight() {
  const x = 0.5;
  const y = 0.5;
  const z = 0.5;

  // lightness
  const L = 40;

  const retval = Cube.unitCube(new Rad.Spectra(1, 1, 1), new Rad.Spectra(L, L, L), 1);

  const roomXform = new Transform3();
  roomXform.scale(x, y, z);
  roomXform.translate(-x / 2, -y / 2, -z / 2);
  roomXform.transform(retval);

  return retval;
}
