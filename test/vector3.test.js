import Vector3 from '../radiosity/vector3.js';

test('length()', () => {
  const v = new Vector3(1, 2, 3);
  expect(v.length).toBe(Math.sqrt(14));
});

test('add()', () => {
  const v1 = new Vector3(1, 2, 3);
  const v2 = new Vector3(4, 5, 6);
  expect(v1.add(v2)).toEqual(new Vector3(5, 7, 9));
});

test('sub()', () => {
  const v1 = new Vector3(1, 2, 3);
  const v2 = new Vector3(4, 5, 6);
  expect(v1.sub(v2)).toEqual(new Vector3(-3, -3, -3));
});

test('scale()', () => {
  const v1 = new Vector3(1, 2, 3);
  expect(v1.scale(-2)).toEqual(new Vector3(-2, -4, -6));
});

test('dot()', () => {
  const v1 = new Vector3(1, 2, 3);
  const v2 = new Vector3(4, 5, 6);
  expect(v1.dot(v2)).toBe(32);
});

test('cross()', () => {
  const v1 = new Vector3(1, 2, 3);
  const v2 = new Vector3(4, 5, 6);
  expect(v1.cross(v2)).toEqual(new Vector3(-3, 6, -3));
});
