import Vector3 from '../../radiosity/vector3.js';
import Point3 from '../../radiosity/point3.js';

test('constructor', () => {
  const p1 = new Point3(1, 2, 3.14);
  expect(p1).toMatchObject({ x: 1, y: 2, z: 3.14 });

  const p2 = new Point3(p1);
  expect(p2).not.toBe(p1);
  expect(p2).toStrictEqual(p1);
  expect(p2).toMatchObject({ x: 1, y: 2, z: 3.14 });
});

test('addVector()', () => {
  const p = new Point3(-4, 2, -7);
  const v = new Vector3(1, 2, 3);
  expect(p.addVector(v)).toStrictEqual(new Point3(-3, 4, -4));

  expect(() => p.addVector(p)).toThrow(TypeError);
});

test('dist()', () => {
  const p = new Point3(-4, 2, -7);
  const p2 = new Point3(1, 2, 3);

  expect(p.dist(p2)).toBe(Math.sqrt(125));
});
