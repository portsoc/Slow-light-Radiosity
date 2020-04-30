import FormPoly from '../../radiosity/formpoly.js';
import Vector4 from '../../radiosity/vector4.js';
import Point3 from '../../radiosity/point3.js';

test('reset()', () => {
  const f1 = new FormPoly();

  // reset
  expect(f1.reset()).toBe(f1);
  expect(f1.numPoints).toBe(0);
});

test('addVertex()', () => {
  const f1 = new FormPoly();

  // add vertex
  const v1 = new Vector4(1, 2, 3, 4);
  expect(f1.addVertex(v1)).toBe(f1);
  expect(f1.points[0]).toStrictEqual(new Point3(0.25, 0.5, 0.75));
  expect(f1.numPoints).toBe(1);

  // add a second vertex
  const v2 = new Vector4(-21, 12, 6, -6);
  f1.addVertex(v2);
  expect(f1.points[1]).toStrictEqual(new Point3(3.5, -2, -1));
  expect(f1.numPoints).toBe(2);
});

test('getPoint()', () => {
  const f1 = new FormPoly();

  // get point
  expect(f1.getPoint(0)).toEqual({ x: undefined, y: undefined, z: undefined });
  expect(f1.getPoint(1)).toEqual({ x: undefined, y: undefined, z: undefined });

  // add vertex
  const v1 = new Vector4(1, 2, 3, 4);
  f1.addVertex(v1);

  // get point
  expect(f1.getPoint(0)).toStrictEqual(new Point3(0.25, 0.5, 0.75));
  expect(f1.getPoint(1)).toEqual({ x: undefined, y: undefined, z: undefined });

  // add second vertex
  const v2 = new Vector4(-21, 12, 6, -6);
  f1.addVertex(v2);

  /// get point
  expect(f1.getPoint(0)).toStrictEqual(new Point3(0.25, 0.5, 0.75));
  expect(f1.getPoint(1)).toStrictEqual(new Point3(3.5, -2, -1));
});
