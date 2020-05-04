import Vector4 from '../../radiosity/vector4.js';
import Point3 from '../../radiosity/point3.js';

test('constructor', () => {
  const v1 = new Vector4(1, 2, 3, 4);
  expect(v1).toMatchObject({ x: 1, y: 2, z: 3, w: 4 });

  const v2 = new Vector4(v1);
  expect(v2).not.toBe(v1);
  expect(v2).toStrictEqual(v1);
  expect(v2).toMatchObject({ x: 1, y: 2, z: 3, w: 4 });
});

test('length()', () => {
  expect(new Vector4(1, 2, 3, 4).length).toBe(Math.sqrt(30));
  expect(new Vector4(0, 0, 0, 0).length).toBe(0);
});

test('add()', () => {
  const v1 = new Vector4(1, 2, 3, 4);
  const v2 = new Vector4(5, 6, 7, 8);

  // returns itself
  expect(v1.add(v2)).toBe(v1);

  // adds in place
  expect(v1).toStrictEqual(new Vector4(6, 8, 10, 12));
  expect(v1.add(v2)).toStrictEqual(new Vector4(11, 14, 17, 20));

  // doesn't change the other vector
  expect(v2).toStrictEqual(new Vector4(5, 6, 7, 8));
});

test('sub()', () => {
  const v1 = new Vector4(1, 2, 3, 4);
  const v2 = new Vector4(5, 6, 7, 8);

  // returns itself
  expect(v1.sub(v2)).toBe(v1);

  // subtracts in place
  expect(v1).toStrictEqual(new Vector4(-4, -4, -4, -4));
  expect(v1.sub(v2)).toStrictEqual(new Vector4(-9, -10, -11, -12));

  // doesn't change the other vector
  expect(v2).toStrictEqual(new Vector4(5, 6, 7, 8));
});

test('scale()', () => {
  const v1 = new Vector4(1, 2, 3, 4);

  // returns itself
  expect(v1.scale(-2)).toBe(v1);

  // scales in place
  expect(v1).toStrictEqual(new Vector4(-2, -4, -6, -8));
  expect(v1.scale(3)).toStrictEqual(new Vector4(-6, -12, -18, -24));
});

test('div()', () => {
  const v1 = new Vector4(49 * 2, 49 * 3, 49 * 4, 49 * 5);
  // the following would fail with v1.scale(1/49)
  expect(v1.div(49)).toStrictEqual(new Vector4(2, 3, 4, 5));
});

test('normalize()', () => {
  const v1 = new Vector4(1, 0, 0, 0);

  // returns itself
  expect(v1.normalize()).toBe(v1);

  // unit vector normalizes to itself
  expect(v1).toStrictEqual(new Vector4(1, 0, 0, 0));

  // zero vector normalizes to itself
  const v0 = new Vector4(0, 0, 0, 0);
  expect(v0.normalize()).toStrictEqual(new Vector4(0, 0, 0, 0));

  // non-zero vector normalizes to length of 1
  const v2 = new Vector4(2, 3, 4, 5);
  expect(v2.length).toBeCloseTo(7.348469228, 5);

  v2.normalize();
  expect(v2.length).toBeCloseTo(1, 5);
  expect(v2.x).toBeCloseTo(0.2721655269, 5);
  expect(v2.y).toBeCloseTo(0.4082482904, 5);
  expect(v2.z).toBeCloseTo(0.5443310539, 5);
});

test('dot()', () => {
  const v1 = new Vector4(1, 2, 3, 4);
  const v2 = new Vector4(5, 6, 7, 8);
  expect(v1.dot(v2)).toBe(70);

  // commutative
  expect(v2.dot(v1)).toBe(70);

  // dot has no side effect
  expect(v1).toStrictEqual(new Vector4(1, 2, 3, 4));
  expect(v2).toStrictEqual(new Vector4(5, 6, 7, 8));

  // zero vector
  const v0 = new Vector4(0, 0, 0, 0);
  expect(v1.dot(v0)).toBe(0);

  // perpendicular vectors
  const v3 = new Vector4(1, -13, 3, 4);
  expect(v1.dot(v3)).toBe(0);
});

test('setToProjection()', () => {
  const v1 = new Vector4(1, 2, 3, 4);
  const v2 = new Vector4(2, 3, 4, 5);

  // set pojection to the origin point by the identity matrix
  const p1 = new Point3(0, 0, 0);
  const m1 = [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ];
  expect(v1.setToProjection(p1, m1)).toBe(v1);
  expect(v1).toStrictEqual(new Vector4(0, 0, 0, 1));

  // non-trivial case
  const p2 = new Point3(-4, 5, -6);
  const m2 = [
    [2, -8, 0, -17],
    [0, 3, 2, 8],
    [0, 17, -1, 0],
    [8, -3, 0, 1],
  ];
  expect(v2.setToProjection(p2, m2)).toStrictEqual(new Vector4(-65, 11, 91, -46));
});

test('projectTPoint()', () => {
  const v1 = new Vector4(1, 2, 3, 4);
  const p1 = new Point3(-5, 7, 11);
  expect(v1.projectToPoint(p1)).toBe(p1);
  expect(p1).toStrictEqual(new Point3(0.25, 0.5, 0.75));
});

test('setTo()', () => {
  const v1 = new Vector4(1, 2, 3, 4);
  const v2 = new Vector4(6, 7, 8, 9);

  expect(v1).toStrictEqual(new Vector4(1, 2, 3, 4));
  expect(v2).toStrictEqual(new Vector4(6, 7, 8, 9));

  v1.setTo(v2);
  expect(v1).not.toBe(v2);
  expect(v1).toStrictEqual(new Vector4(6, 7, 8, 9));
  expect(v2).toStrictEqual(new Vector4(6, 7, 8, 9));
});
