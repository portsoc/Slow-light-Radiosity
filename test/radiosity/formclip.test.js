import FormClip from '../../radiosity/formclip.js';
import Patch3 from '../../radiosity/patch3.js';
import Vertex3 from '../../radiosity/vertex3.js';
import Point3 from '../../radiosity/point3.js';

test('isFacingAway()', () => {
  // set up FormClip
  const fc = new FormClip(null); // no FormClipEdge necessary to test isFacingAway()

  /*
   * ^ y
   * |
   * p3 ----- p2
   * |        |
   * |        |
   * p0 ----- p1  -> x
   */

  // set up patch
  let points = [
    new Point3(0, 0, 0),
    new Point3(1, 0, 0),
    new Point3(1, 1, 0),
    new Point3(0, 1, 0),
  ];
  let vertices = points.map(p => new Vertex3(p));
  const patch1 = new Patch3(vertices);

  // origin below the patch
  fc.origin = new Point3(0.5, 0.5, -2);
  expect(fc.isFacingAway(patch1)).toBe(true);

  // origin still below, more to the side
  fc.origin = new Point3(5, 5, -2);
  expect(fc.isFacingAway(patch1)).toBe(true);

  // origin in the same plane as the patch, counts as facing away
  fc.origin = new Point3(5, 5, 0);
  expect(fc.isFacingAway(patch1)).toBe(true);

  // origin above the patch
  fc.origin = new Point3(0, 0, 1);
  expect(fc.isFacingAway(patch1)).toBe(false);

  /* different coordinates, patch facing towards -y
   *               ^ y
   *               |
   *              p0 ------ p1
   *              /|       /
   *    z <------/-0      /
   *            / /      /
   *          p3 ------ p2
   *            /
   *           x
   */

  // set up patch
  points = [
    new Point3(0, 1, 0),
    new Point3(0, 1, -1),
    new Point3(1, 1, -1),
    new Point3(1, 1, 0),
  ];
  vertices = points.map(p => new Vertex3(p));
  const patch2 = new Patch3(vertices);

  fc.origin = new Point3(3, 2, 1);
  expect(fc.isFacingAway(patch2)).toBe(true);

  fc.origin = new Point3(3, 0, 1);
  expect(fc.isFacingAway(patch2)).toBe(false);
});

// clip() is tested through hemiclip
