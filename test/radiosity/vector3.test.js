import Vector3 from '../../radiosity/vector3.js';

test('constructor', () => {
  const v1 = new Vector3(1, 2, 3);
  expect(v1).toMatchObject({ x: 1, y: 2, z: 3 });

  const v2 = new Vector3(v1);
  expect(v2).not.toBe(v1);
  expect(v2).toStrictEqual(v1);
  expect(v2).toMatchObject({ x: 1, y: 2, z: 3 });
});

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
  expect(v1).toStrictEqual(new Vector3(5, 7, 9));
  expect(v1.add(v2)).toStrictEqual(new Vector3(9, 12, 15));

  // doesn't change the other vector
  expect(v2).toStrictEqual(new Vector3(4, 5, 6));
});

test('sub()', () => {
  const v1 = new Vector3(1, 2, 3);
  const v2 = new Vector3(4, 5, 6);
  // returns itself
  expect(v1.sub(v2)).toBe(v1);

  // subtracts in place
  expect(v1).toStrictEqual(new Vector3(-3, -3, -3));
  expect(v1.sub(v2)).toStrictEqual(new Vector3(-7, -8, -9));

  // doesn't change the other vector
  expect(v2).toStrictEqual(new Vector3(4, 5, 6));
});

test('scale()', () => {
  const v1 = new Vector3(1, 2, 3);

  // returns itself
  expect(v1.scale(-2)).toBe(v1);

  // scales in place
  expect(v1).toStrictEqual(new Vector3(-2, -4, -6));
  expect(v1.scale(3)).toStrictEqual(new Vector3(-6, -12, -18));
});

test('div()', () => {
  const v1 = new Vector3(49 * 2, 49 * 3, 49 * 4);
  // the following would fail with v1.scale(1/49)
  expect(v1.div(49)).toStrictEqual(new Vector3(2, 3, 4));
});

test('normalize()', () => {
  const v1 = new Vector3(1, 0, 0);

  // returns itself
  expect(v1.normalize()).toBe(v1);

  // unit vector normalizes to itself
  expect(v1).toStrictEqual(new Vector3(1, 0, 0));

  // zero vector normalizes to itself
  const v0 = new Vector3(0, 0, 0);
  expect(v0.normalize()).toStrictEqual(new Vector3(0, 0, 0));

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
  expect(v1).toStrictEqual(new Vector3(1, 2, 3));
  expect(v2).toStrictEqual(new Vector3(4, 5, 6));

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
  expect(v1.cross(v2)).toStrictEqual(new Vector3(-3, 6, -3));

  // cross has no side effect
  expect(v1).toStrictEqual(new Vector3(1, 2, 3));
  expect(v2).toStrictEqual(new Vector3(4, 5, 6));

  // cross against negated vector is negated result
  expect(v1.cross(v2Neg)).toStrictEqual(new Vector3(3, -6, 3));

  // anticommutative
  expect(v2.cross(v1)).toStrictEqual(new Vector3(-3, 6, -3).scale(-1));

  // same vector, or vector in the same direction
  expect(v1.cross(v1)).toStrictEqual(new Vector3(0, 0, 0));
  const v1s = new Vector3(2, 4, 6);
  expect(v1.cross(v1s)).toStrictEqual(new Vector3(0, 0, 0));

  // unit vectors
  const v100 = new Vector3(1, 0, 0);
  const v010 = new Vector3(0, 1, 0);
  const v001 = new Vector3(0, 0, 1);
  expect(v100.cross(v010)).toStrictEqual(v001);
  expect(v010.cross(v001)).toStrictEqual(v100);
  expect(v001.cross(v100)).toStrictEqual(v010);
});

test('negated()', () => {
  const v = new Vector3(5, -11, 1);
  const vNeg = v.negated();
  expect(vNeg).not.toBe(v);
  expect(vNeg).toStrictEqual(new Vector3(-5, 11, -1));
});

test('random()', () => {
  // mock
  const mockRandom = jest.spyOn(global.Math, 'random').mockImplementation(() => 0.75);

  expect(Vector3.random()).toStrictEqual(new Vector3(0.5, 0.5, 0.5));
  expect(mockRandom).toHaveBeenCalled();

  // restore mock
  mockRandom.mockRestore();
});
