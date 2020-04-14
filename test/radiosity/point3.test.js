import Vector3 from '../../radiosity/vector3.js';
import Point3 from '../../radiosity/point3.js';

test('constructor', () => {
  expect(new Point3(1, 2, 3.14)).toMatchObject({ x: 1, y: 2, z: 3.14 });
});

test('addVector()', () => {
  const p = new Point3(-4, 2, -7);
  const v = new Vector3(1, 2, 3);
  expect(p.addVector(v)).toStrictEqual(new Point3(-3, 4, -4));

  expect(() => p.addVector(p)).toThrow(TypeError);
});
