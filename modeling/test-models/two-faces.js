/* istanbul ignore file */ // don't report as not covered by tests, we test these visually

// two unit square faces facing each other at unit distance
// as in the book, listing 5.25

import * as Rad from '../../radiosity/index.js';
import Transform3 from '../transform3.js';
import * as Face from '../singleface.js';

export default function createTwoSameFaces(subdivision = 1) {
  const face1 = Face.singleFace(new Rad.Spectra(0.12, 0.81, 0.21), null, subdivision);
  const face2 = Face.singleFace(new Rad.Spectra(0.7, 0.2, 0.2), null, subdivision);

  // first face is lower
  const xform1 = new Transform3();
  xform1.translate(0, 0, -0.5);

  // second face is above, turned around so it faces downwards
  const xform2 = new Transform3();
  xform2.rotateX(180);
  xform2.translate(0, 1, 0.5);

  xform1.transform(face1);
  xform2.transform(face2);

  return new Rad.Environment([face1, face2]);
}
