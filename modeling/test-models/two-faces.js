/* istanbul ignore file */ // don't report as not covered by tests, we test these visually

// two unit square faces facing each other at unit distance
// as in the book, listing 5.25

import * as Rad from '../../radiosity/index.js';
import Transform3 from '../transform3.js';
import * as Face from '../singleface.js';

export default function createTwoSameFaces(subdivision = 1) {
  const face1 = Face.singleFace(new Rad.Spectra(0.6, 1, 0.6), null, 2);
  const face2 = Face.twoTriangles(new Rad.Spectra(1, 0.6, 0.6), null, 2);

  const light = Face.singleFace(new Rad.Spectra(0.6, 0.6, 1), new Rad.Spectra(100, 100, 100), subdivision);

  // first face is lower
  const xform1 = new Transform3();
  xform1.rotateX(90);
  xform1.translate(0, 2, 0);

  // second face is above, turned around so it faces downwards
  const xform2 = new Transform3();
  xform2.rotateX(90);
  xform2.translate(0, 1, 0);

  const xform3 = new Transform3();
  xform3.rotateX(-90);
  xform3.translate(0, 0, 1);

  xform1.transform(face1);
  xform2.transform(face2);
  xform3.transform(light);

  return new Rad.Environment([light, face1, face2]);
}
