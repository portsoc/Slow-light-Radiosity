import Element3 from '../../radiosity/element3.js';
import Point3 from '../../radiosity/point3.js';
import Vertex3 from '../../radiosity/vertex3.js';
import Vector3 from '../../radiosity/vector3.js';
import Spectra from '../../radiosity/spectra.js';

// ^ y
// |
// 3 ----- 2
// |   e   |
// 0 ----- 1  -> x

test('constructor', () => {
  const p1 = [
    new Point3(0, 0, 0),
    new Point3(1, 0, 0),
    new Point3(1, 1, 0),
    new Point3(0, 1, 0),
  ];
  const v1 = p1.map(p => new Vertex3(p));
  const e1 = new Element3(v1);

  expect(e1.exitance).toStrictEqual(new Spectra());
  expect(v1[0].elements).toStrictEqual([e1]);

  const tooFewVertices = v1.slice(0, 2);
  const tooManyVertices = v1.concat(v1);
  expect(() => new Element3(tooFewVertices)).toThrow(TypeError);
  expect(() => new Element3(tooManyVertices)).toThrow(TypeError);
  expect(() => new Element3()).toThrow(TypeError);
});

test('area()', () => {
  const p1 = [
    new Point3(0, 0, 0),
    new Point3(1, 0, 0),
    new Point3(1, 1, 0),
    new Point3(0, 1, 0),
  ];
  const v1 = p1.map(p => new Vertex3(p));
  const e1 = new Element3(v1);

  expect(e1.area).toBe(1);
  expect(e1.area).toBe(1); // to cover case where area is precomputed

  const p2 = [
    new Point3(0, 0, 0),
    new Point3(1, 0, 0),
    new Point3(1, 1, 0),
  ];
  const v2 = p2.map(p => new Vertex3(p));
  const e2 = new Element3(v2);

  expect(e2.area).toBe(0.5);

  const p3 = [
    new Point3(0, 0, 0),
    new Point3(1, 0, 0),
    new Point3(0.5, -2, 0),
  ];
  const v3 = p3.map(p => new Vertex3(p));
  const e3 = new Element3(v3);

  expect(e3.area).toBe(1);
});

test('normal()', () => {
  // simple element in XY plane
  const p1 = [
    new Point3(0, 0, 0),
    new Point3(1, 0, 0),
    new Point3(1, 1, 0),
    new Point3(0, 1, 0),
  ];
  const v1 = p1.map(p => new Vertex3(p));
  const e1 = new Element3(v1);
  const n1 = e1.normal;

  expect(n1).toBeInstanceOf(Vector3);
  expect(n1).toStrictEqual(new Vector3(0, 0, 1));
  expect(n1).toBe(e1.normal); // normal should only be computed once

  // raised towards 1,1,1
  const p2 = [
    new Point3(0, 0, 0),
    new Point3(1, 0, 0.5),
    new Point3(1, 1, 1),
    new Point3(0, 1, 0.5),
  ];
  const v2 = p2.map(p => new Vertex3(p));
  const e2 = new Element3(v2);
  const n2 = e2.normal;

  expect(n2.x).toBeCloseTo(-0.4082482905, 5);
  expect(n2.y).toBeCloseTo(-0.4082482905, 5);
  expect(n2.z).toBeCloseTo(0.8164965809, 5);

  // the normal should be the same independent of which three vertices we take
  for (let i = 0; i < p2.length; i += 1) {
    const p3 = p2.slice();
    p3.splice(i, 1); // remove i-th element

    const v3 = p3.map(p => new Vertex3(p));
    const e3 = new Element3(v3);
    const n3 = e3.normal;

    expect(n3.x).toBeCloseTo(-0.4082482905, 5);
    expect(n3.y).toBeCloseTo(-0.4082482905, 5);
    expect(n3.z).toBeCloseTo(0.8164965809, 5);
  }
});

test('center()', () => {
  // Points
  const points = [
    new Point3(0, 0, 0),
    new Point3(0, -2, 0),
    new Point3(2, -2, 0),
    new Point3(2, 0, 0),
  ];
  const el = new Element3(points.map(p => new Vertex3(p)));
  expect(el.center).toStrictEqual(new Point3(1, -1, 0));
  expect(el.center).toStrictEqual(new Point3(1, -1, 0)); // to cover the case center is cached
});
