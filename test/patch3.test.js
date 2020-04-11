import Patch3 from '../radiosity/patch3';
import Point3 from '../radiosity/point3';
import Vertex3 from '../radiosity/vertex3';

// 1 ----- 4 ----- 6
// |   e   |   e   |
// |   1   |   4   |
// 2 ----- 3 ----- 5   ====> Patch
// |   e   |   e   |
// |   2   |   3   |
// 7 ----- 8 ----- 9

test('unsentFlux()', () => {
  // Points
  const p1 = new Point3(0, 0, 0);
  const p2 = new Point3(2, 0, 0);
  const p3 = new Point3(2, 2, 0);
  const p4 = new Point3(0, 2, 0);
  // Patch
  const p = new Patch3(
    [
      new Vertex3(p1),
      new Vertex3(p2),
      new Vertex3(p3),
      new Vertex3(p4),
    ],
    null);
  p.exitance.r = 12;
  p.exitance.g = 1;
  p.exitance.b = 37;
  expect(p.unsentFlux).toBe(200);
});

test('center()', () => {
  // Points
  const p1 = new Point3(0, 0, 0);
  const p7 = new Point3(0, -2, 0);
  const p9 = new Point3(2, -2, 0);
  const p6 = new Point3(2, 0, 0);
  // Patch
  const p = new Patch3(
    [
      new Vertex3(p1),
      new Vertex3(p7),
      new Vertex3(p9),
      new Vertex3(p6),
    ],
    null);
  expect(p.center).toEqual(new Point3(1, -1, 0));
});
