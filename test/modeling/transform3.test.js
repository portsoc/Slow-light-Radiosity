import Transform3 from '../../modeling/transform3.js';
import Point3 from '../../radiosity/point3.js';

test('identity()', () => {
  const t = new Transform3();
  expect(t.identity()).toStrictEqual([
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
  ]);
});

test('rotateX()', () => {
  const t = new Transform3();
  expect(t.rotateX(20)).toStrictEqual([
    [1, 0, 0, 0],
    [0, Math.cos(20), -Math.sin(20), 0],
    [0, Math.sin(20), Math.cos(20), 0],
  ]);
});

test('rotateY()', () => {
  const t = new Transform3();
  expect(t.rotateY(20)).toStrictEqual([
    [Math.cos(20), 0, Math.sin(20), 0],
    [0, 1, 0, 0],
    [-Math.sin(20), 0, Math.cos(20), 0],
  ]);
});

test('rotateZ()', () => {
  const t = new Transform3();
  expect(t.rotateZ(20)).toStrictEqual([
    [Math.cos(20), -Math.sin(20), 0, 0],
    [Math.sin(20), Math.cos(20), 0, 0],
    [0, 0, 1, 0],
  ]);
});

test('scale()', () => {
  const t = new Transform3();
  t.scales = [1, 2, 3];
  expect(t.scale()).toStrictEqual([
    [1, 0, 0, 0],
    [0, 2, 0, 0],
    [0, 0, 3, 0],
  ]);
});

test('translate()', () => {
  const t = new Transform3();
  t.translations = [1, 2, 3];
  expect(t.translate()).toStrictEqual([
    [1, 0, 0, 1],
    [0, 1, 0, 2],
    [0, 0, 1, 3],
  ]);
});

test('buildTransform()', () => {
  const t = new Transform3();
  // Parameters
  const alpha = 10; const beta = 30; const gamma = 50;
  t.rotations = [alpha, beta, gamma];
  t.translations = [1, 2, 3];
  t.scales = [2, 4, 6];
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
  t.buildTransform();
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

test('transform()', () => {
  const t = new Transform3();
  // Parameters
  t.translations = [1, 2, 3];
  t.scales = [1, 2, 3];
  t.buildTransform();
  // Point
  const p = new Point3(-2, 15, -7);
  // Test
  expect(t.transform(p)).toStrictEqual(new Point3(-1, 32, -18));
});
