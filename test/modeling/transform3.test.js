import Transform3, { mmult } from '../../modeling/transform3.js';
import Point3 from '../../radiosity/point3.js';

test('constructor', () => {
  const t = new Transform3();
  expect(t.matrix).toStrictEqual([
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ]);
});

test('rotateX()', () => {
  const deg = 20;
  const t = new Transform3().rotateX(deg);
  const rad = deg / 180 * Math.PI;
  expect(t.matrix).toStrictEqual([
    [1, 0, 0, 0],
    [0, Math.cos(rad), -Math.sin(rad), 0],
    [0, Math.sin(rad), Math.cos(rad), 0],
    [0, 0, 0, 1],
  ]);
});

test('rotateY()', () => {
  const deg = 20;
  const t = new Transform3().rotateY(deg);
  const rad = deg / 180 * Math.PI;
  expect(t.matrix).toStrictEqual([
    [Math.cos(rad), 0, Math.sin(rad), 0],
    [0, 1, 0, 0],
    [-Math.sin(rad), 0, Math.cos(rad), 0],
    [0, 0, 0, 1],
  ]);
});

test('rotateZ()', () => {
  const deg = 20;
  const t = new Transform3().rotateZ(deg);
  const rad = deg / 180 * Math.PI;
  expect(t.matrix).toStrictEqual([
    [Math.cos(rad), -Math.sin(rad), 0, 0],
    [Math.sin(rad), Math.cos(rad), 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ]);
});

test('rotate()', () => {
  const t1 = new Transform3().rotate(10, 20, 30);
  const t2 = new Transform3().rotateX(10).rotateY(20).rotateZ(30);
  const t3 = new Transform3().rotateZ(30).rotateY(20).rotateX(10);

  expect(t1).toStrictEqual(t2);
  expect(t3).not.toStrictEqual(t2);
});

test('scale()', () => {
  const t = new Transform3().scale(1, 2, 3);
  expect(t.matrix).toStrictEqual([
    [1, 0, 0, 0],
    [0, 2, 0, 0],
    [0, 0, 3, 0],
    [0, 0, 0, 1],
  ]);
});

test('translate()', () => {
  const t = new Transform3().translate(1, 2, 3);
  expect(t.matrix).toStrictEqual([
    [1, 0, 0, 1],
    [0, 1, 0, 2],
    [0, 0, 1, 3],
    [0, 0, 0, 1],
  ]);
});

test('complete transformation', () => {
  // Parameters
  const rotations = [10, 30, 50];
  const translations = [1, 2, 3];
  const scales = [2, 4, 6];

  const t = new Transform3();
  t.scale(...scales);
  t.rotate(...rotations);
  t.translate(...translations);

  const alpha = rotations[0] / 180 * Math.PI;
  const beta = rotations[1] / 180 * Math.PI;
  const gamma = rotations[2] / 180 * Math.PI;

  // Matrix result --> https://math.stackexchange.com/questions/1882276/combining-all-three-rotation-matrices
  const a = Math.cos(beta) * Math.cos(gamma);
  const b = Math.cos(beta) * Math.sin(gamma);
  const c = -Math.sin(beta);
  const d = Math.sin(alpha) * Math.sin(beta) * Math.cos(gamma) - Math.cos(alpha) * Math.sin(gamma);
  const e = Math.sin(alpha) * Math.sin(beta) * Math.sin(gamma) + Math.cos(alpha) * Math.cos(gamma);
  const f = Math.sin(alpha) * Math.cos(beta);
  const g = Math.cos(alpha) * Math.sin(beta) * Math.cos(gamma) + Math.sin(alpha) * Math.sin(gamma);
  const h = Math.cos(alpha) * Math.sin(beta) * Math.sin(gamma) - Math.sin(alpha) * Math.cos(gamma);
  const i = Math.cos(alpha) * Math.cos(beta);

  // Test
  // [2 * a, 4 * d, 6 * g, 1]
  // [2 * b, 4 * e, 6 * h, 2]
  // [2 * c, 4 * f, 6 * i, 3]
  expect(t.matrix[0][0]).toBeCloseTo(2 * a, 5);
  expect(t.matrix[0][1]).toBeCloseTo(4 * d, 5);
  expect(t.matrix[0][2]).toBeCloseTo(6 * g, 5);
  expect(t.matrix[0][3]).toBe(1);
  expect(t.matrix[1][0]).toBeCloseTo(2 * b, 5);
  expect(t.matrix[1][1]).toBeCloseTo(4 * e, 5);
  expect(t.matrix[1][2]).toBeCloseTo(6 * h, 5);
  expect(t.matrix[1][3]).toBe(2);
  expect(t.matrix[2][0]).toBeCloseTo(2 * c, 5);
  expect(t.matrix[2][1]).toBeCloseTo(4 * f, 5);
  expect(t.matrix[2][2]).toBeCloseTo(6 * i, 5);
  expect(t.matrix[2][3]).toBe(3);
});

test('transformPoint()', () => {
  const t = new Transform3().scale(1, 2, 3).translate(1, 2, 3);
  const p = new Point3(-2, 15, -7);
  expect(t.transform(p)).toStrictEqual(new Point3(-1, 32, -18));
  expect(t.transformPoint(p)).toStrictEqual(new Point3(0, 66, -51));
});

test('transform with unknown object', () => {
  const t = new Transform3().scale(1, 2, 3).translate(1, 2, 3);
  const p = { x: -2, y: 15, z: -7 };
  expect(() => t.transform(p)).toThrow(TypeError);
});

test('mmult()', () => {
  const a = [[1, 2, 3, 4], [2, 3, 4, 5], [5, 6, 0, 1], [-1, -2, -3, 4]];
  const b = [[4, 3, 2, 1], [-2, -3, 2, 3], [1, 2, 1, 2], [0, -1, 2, 3]];
  const c = [[3, -1, 17, 25], [6, 0, 24, 34], [8, -4, 24, 26], [-3, -7, -1, -1]];

  // computed by wolfram alpha
  expect(mmult(a, b)).toStrictEqual(c);

  // associativity
  expect(mmult(mmult(a, b), c)).toStrictEqual(mmult(a, mmult(b, c)));
  expect(mmult(mmult(a, b), c)).toStrictEqual(mmult(a, b, c));
});
