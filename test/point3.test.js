import Vector3 from '../radiosity/vector3.js';
import Point3 from '../radiosity/point3.js';

test('addVector()', () => {
  const p = new Point3(-4, 2, -7);
  const v = new Vector3(1, 2, 3);
  expect(p.addVector(v)).toEqual(new Point3(-3, 4, -4));
});
