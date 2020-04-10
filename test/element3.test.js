import Element3 from '../radiosity/element3.js';
import Point3 from '../radiosity/point3.js';
import Vertex3 from '../radiosity/vertex3.js';
import Vector3 from '../radiosity/vector3.js';

// 1 ----- 4 ----- 6
// |   e   |   e   |
// |   1   |   4   |
// 2 ----- 3 ----- 5   ====> Patch
// |   e   |   e   |
// |   2   |   3   |
// 7 ----- 8 ----- 9

test('numVert()', () => {
  // Points
  const p1 = new Point3(0, 0, 0);
  const p2 = new Point3(0, -1, 0);
  const p3 = new Point3(1, -1, 0);
  const p4 = new Point3(1, 0, 0);
  // Element
  const e1 = new Element3(
    [
      new Vertex3(p1),
      new Vertex3(p2),
      new Vertex3(p3),
      new Vertex3(p4),
    ],
    null);
  expect(e1.numVert).toBe(4);
});

test('area()', () => {
  // Points
  const p1 = new Point3(0, 0, 0);
  const p2 = new Point3(0, -1, 0);
  const p3 = new Point3(1, -1, 0);
  const p4 = new Point3(1, 0, 0);
  // Element
  const e1 = new Element3(
    [
      new Vertex3(p1),
      new Vertex3(p2),
      new Vertex3(p3),
      new Vertex3(p4),
    ],
    null);
  expect(e1.area).toBe(1);
});

test('normal()', () => {
  // Points
  const p1 = new Point3(0, 0, 0);
  const p2 = new Point3(0, -1, 0);
  const p3 = new Point3(1, -1, 0);
  const p4 = new Point3(1, 0, 0);
  // Element
  const e1 = new Element3(
    [
      new Vertex3(p1),
      new Vertex3(p2),
      new Vertex3(p3),
      new Vertex3(p4),
    ],
    null);
  expect(e1.normal).toMatchObject(new Vector3(0, 0, 1));
});
