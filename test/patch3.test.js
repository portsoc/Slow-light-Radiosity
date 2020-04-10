import Patch3 from '../radiosity/patch3.js';
import Point3 from '../radiosity/point3.js';
import Vertex3 from '../radiosity/vertex3.js';

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
  const p7 = new Point3(-2, 0, 0);
  const p9 = new Point3(-2, 2, 0);
  const p6 = new Point3(0, 2, 0);
  // Patch
  const p = new Patch3(
    [
      new Vertex3(p1),
      new Vertex3(p7),
      new Vertex3(p9),
      new Vertex3(p6),
    ],
    null);
  p.exitance.redBand = 12;
  p.exitance.greenBand = 0;
  p.exitance.blueBand = 37;
  expect(p.unsentFlux).toBe(196);
});

test('center()', () => {
  // Points
  const p1 = new Point3(0, 0, 0);
  const p7 = new Point3(-2, 0, 0);
  const p9 = new Point3(-2, 2, 0);
  const p6 = new Point3(0, 2, 0);
  // Patch
  const p = new Patch3(
    [
      new Vertex3(p1),
      new Vertex3(p7),
      new Vertex3(p9),
      new Vertex3(p6),
    ],
    null);
  expect(p.center).toMatchObject(new Point3(-1, 1, 0));
});
