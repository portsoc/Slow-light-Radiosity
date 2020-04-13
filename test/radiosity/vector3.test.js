import Vector3 from '../../radiosity/vector3.js';

test('length()', () => {
  expect(new Vector3(1, 2, 3).length).toBe(Math.sqrt(14));
  expect(new Vector3(0, 0, 0).length).toBe(0);
});

test('add()', () => {
  const v1 = new Vector3(1, 2, 3);
  const v2 = new Vector3(4, 5, 6);

  // returns itself
  expect(v1.add(v2)).toBe(v1);

  // adds in place
  expect(v1).toEqual(new Vector3(5, 7, 9));
  expect(v1.add(v2)).toEqual(new Vector3(9, 12, 15));

  // doesn't change the other vector
  expect(v2).toEqual(new Vector3(4, 5, 6));
});

test('sub()', () => {
  const v1 = new Vector3(1, 2, 3);
  const v2 = new Vector3(4, 5, 6);
  // returns itself
  expect(v1.sub(v2)).toBe(v1);

  // subtracts in place
  expect(v1).toEqual(new Vector3(-3, -3, -3));
  expect(v1.sub(v2)).toEqual(new Vector3(-7, -8, -9));

  // doesn't change the other vector
  expect(v2).toEqual(new Vector3(4, 5, 6));
});

test('scale()', () => {
  const v1 = new Vector3(1, 2, 3);

  // returns itself
  expect(v1.scale(-2)).toBe(v1);

  // scales in place
  expect(v1).toEqual(new Vector3(-2, -4, -6));
  expect(v1.scale(3)).toEqual(new Vector3(-6, -12, -18));
});

test('normalize()', () => {
  const v1 = new Vector3(1, 0, 0);

  // returns itself
  expect(v1.normalize()).toBe(v1);

  // unit vector normalizes to itself
  expect(v1).toEqual(new Vector3(1, 0, 0));

  // zero vector normalizes to itself
  const v0 = new Vector3(0, 0, 0);
  expect(v0.normalize()).toEqual(new Vector3(0, 0, 0));

  // non-zero vector normalizes to length of 1
  const v2 = new Vector3(2, 3, 4);
  expect(v2.length).toBeCloseTo(5.3851648071, 5);

  v2.normalize();
  expect(v2.length).toBeCloseTo(1, 5);
  expect(v2.x).toBeCloseTo(0.3713906764, 5);
  expect(v2.y).toBeCloseTo(0.5570860145, 5);
  expect(v2.z).toBeCloseTo(0.7427813527, 5);
});

test('dot()', () => {
  const v1 = new Vector3(1, 2, 3);
  const v2 = new Vector3(4, 5, 6);
  expect(v1.dot(v2)).toBe(32);

  // commutative
  expect(v2.dot(v1)).toBe(32);

  // dot has no side effect
  expect(v1).toEqual(new Vector3(1, 2, 3));
  expect(v2).toEqual(new Vector3(4, 5, 6));

  // zero vector
  const v0 = new Vector3(0, 0, 0);
  expect(v1.dot(v0)).toBe(0);

  // perpendicular vectors
  const v3 = new Vector3(1, -5, 3);
  expect(v1.dot(v3)).toBe(0);
});

test('cross()', () => {
  const v1 = new Vector3(1, 2, 3);
  const v2 = new Vector3(4, 5, 6);
  const v2Neg = new Vector3(-4, -5, -6);
  expect(v1.cross(v2)).toEqual(new Vector3(-3, 6, -3));

  // cross has no side effect
  expect(v1).toEqual(new Vector3(1, 2, 3));
  expect(v2).toEqual(new Vector3(4, 5, 6));

  // cross against negated vector is negated result
  expect(v1.cross(v2Neg)).toEqual(new Vector3(3, -6, 3));

  // anticommutative
  expect(v2.cross(v1)).toEqual(new Vector3(-3, 6, -3).scale(-1));

  // same vector, or vector in the same direction
  expect(v1.cross(v1)).toEqual(new Vector3(0, 0, 0));
  const v1s = new Vector3(2, 4, 6);
  expect(v1.cross(v1s)).toEqual(new Vector3(0, 0, 0));

  // unit vectors
  const v100 = new Vector3(1, 0, 0);
  const v010 = new Vector3(0, 1, 0);
  const v001 = new Vector3(0, 0, 1);
  expect(v100.cross(v010)).toEqual(v001);
  expect(v010.cross(v001)).toEqual(v100);
  expect(v001.cross(v100)).toEqual(v010);
});
