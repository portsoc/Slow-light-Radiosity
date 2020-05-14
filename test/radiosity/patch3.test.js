import Patch3 from '../../radiosity/patch3.js';
import Element3 from '../../radiosity/element3.js';
import Point3 from '../../radiosity/point3.js';
import Vertex3 from '../../radiosity/vertex3.js';

test('constructor', () => {
  const points = [
    new Point3(0, 0, 0),
    new Point3(1, 0, 0),
    new Point3(1, 1, 0),
    new Point3(0, 1, 0),
  ];
  const vertices = points.map(p => new Vertex3(p));
  const p1 = new Patch3(vertices);

  expect(p1.elements).toHaveLength(1);
  expect(p1.elements[0].vertices).toStrictEqual(vertices);

  const tooFewVertices = vertices.slice(0, 2);
  const tooManyVertices = vertices.concat(vertices);
  expect(() => new Patch3(tooFewVertices)).toThrow(TypeError);
  expect(() => new Patch3(tooManyVertices)).toThrow(TypeError);
  expect(() => new Patch3()).toThrow(TypeError);

  const e2 = new Element3(vertices);
  expect(e2.parentPatch).toBeNull();
  const p2 = new Patch3(vertices, [e2]);
  expect(e2.parentPatch).toBe(p2);
  expect(p2.elements).toStrictEqual([e2]);
});

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
    ]);
  p.exitance.r = 12;
  p.exitance.g = 1;
  p.exitance.b = 37;
  expect(p.unsentFlux).toBe(200);
});
