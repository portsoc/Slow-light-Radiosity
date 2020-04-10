import Vertex3 from '../radiosity/vertex3.js';
import Element3 from '../radiosity/element3.js';
import Point3 from '../radiosity/point3.js';
import Patch3 from '../radiosity/patch3.js';
import Vector3 from '../radiosity/vector3.js';

// 1 ----- 4 ----- 6
// |   e   |   e   |
// |   1   |   4   |
// 2 ----- 3 ----- 5   ====> Patch
// |   e   |   e   |
// |   2   |   3   |
// 7 ----- 8 ----- 9

test('normal()', () => {
  // Points
  const p1 = new Point3(0, 0, 0);
  const p2 = new Point3(0, -1, 0);
  const p7 = new Point3(0, -2, 0);
  const p4 = new Point3(1, 0, 0);
  const p3 = new Point3(1, -1, 0);
  const p8 = new Point3(1, -2, 0);
  const p6 = new Point3(2, 0, 0);
  const p5 = new Point3(2, -1, 0);
  const p9 = new Point3(2, -2, 0);
  // Patch
  const patch = new Patch3(
    [
      new Vertex3(p1),
      new Vertex3(p7),
      new Vertex3(p9),
      new Vertex3(p6),
    ],
    null);
  // Elements
  const e1 = new Element3(
    [
      new Vertex3(p1),
      new Vertex3(p2),
      new Vertex3(p3),
      new Vertex3(p4),
    ],
    patch);
  const e2 = new Element3(
    [
      new Vertex3(p2),
      new Vertex3(p7),
      new Vertex3(p8),
      new Vertex3(p9),
    ],
    patch);
  const e3 = new Element3(
    [
      new Vertex3(p3),
      new Vertex3(p8),
      new Vertex3(p9),
      new Vertex3(p5),
    ],
    patch);
  const e4 = new Element3(
    [
      new Vertex3(p4),
      new Vertex3(p3),
      new Vertex3(p5),
      new Vertex3(p6),
    ],
    patch);
  // Test's vertex
  const v = new Vertex3(p3);
  v.elemList = [e1, e2, e3, e4];
  // Test
  expect(v.normal).toEqual(new Vector3(0, 0, 1));
});
