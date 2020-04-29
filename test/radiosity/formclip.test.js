import FormClip from '../../radiosity/formclip.js';
import FormClipEdge from '../../radiosity/formclipedge.js';
import Vector4 from '../../radiosity/vector4.js';
import Patch3 from '../../radiosity/patch3.js';
import Vertex3 from '../../radiosity/vertex3.js';
import Point3 from '../../radiosity/point3.js';
import Element3 from '../../radiosity/element3.js';
import FormPoly from '../../radiosity/formpoly.js';
import HemiClip from '../../radiosity/hemiclip.js';

test('isFacingAway()', () => {
  // set up FormClip
  const v = new Vector4(1, 2, 3, 4);
  const fce = new FormClipEdge(v);
  const fc = new FormClip(fce);

  // ? In front of test

  /*
 * ^ y
 * |
 * p3 ----- p2
 * |        |
 * |        |
 * p0 ----- p1  -> x
 */

  // set FromClip's origin
  const origin1 = new Point3(0.5, 0.5, -2);
  fc.origin = origin1;

  // set up patch
  let p0 = new Point3(0, 0, 0);
  let p1 = new Point3(1, 0, 0);
  let p2 = new Point3(1, 1, 0);
  let p3 = new Point3(0, 1, 0);
  let vertices = [
    new Vertex3(p0),
    new Vertex3(p1),
    new Vertex3(p2),
    new Vertex3(p3),
  ];
  const patch1 = new Patch3(vertices);

  expect(fc.isFacingAway(patch1)).toBe(true);

  // ? Behind test

  /*
 *               ^ y
 *               |
 *           p0 -|------ p3
 *           /   |      /
 *    z <---/----0     /
 *         /    /     /
 *       p1 -------- p2
 *            /
 *           x
 */

  // set FromClip's origin
  const origin2 = new Point3(3, 2, 1.5);
  fc.origin = origin2;

  // set up patch
  p0 = new Point3(-1, 1, 1);
  p1 = new Point3(1, 1, 1);
  p2 = new Point3(1, 1, -1);
  p3 = new Point3(-1, 1, -1);
  vertices = [
    new Vertex3(p0),
    new Vertex3(p1),
    new Vertex3(p2),
    new Vertex3(p3),
  ];
  const patch2 = new Patch3(vertices);

  expect(fc.isFacingAway(patch2)).toBe(false);
});

test('clip()', () => {
});
