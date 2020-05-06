import FormPoly from '../../radiosity/formpoly.js';
import Vector4 from '../../radiosity/vector4.js';
import Point3 from '../../radiosity/point3.js';

test('reset()', () => {
  const f1 = new FormPoly();

  // reset
  expect(f1.reset()).toBe(f1);
  expect(f1.numVert).toBe(0);
});

test('addVertex()', () => {
  const f1 = new FormPoly();

  const v1orig = f1.vertices[0];
  const v2orig = f1.vertices[0];

  // add vertex
  const v1 = new Vector4(1, 2, 3, 4);
  expect(f1.addVertex(v1)).toBe(f1);
  expect(f1.vertices[0]).toStrictEqual(new Point3(0.25, 0.5, 0.75));
  expect(f1.vertices[0]).toBe(v1orig); // the vertices don't change
  expect(f1.numVert).toBe(1);

  // add a second vertex
  const v2 = new Vector4(-11, -12, 6, -16);
  f1.addVertex(v2);
  expect(f1.vertices[1]).toStrictEqual(new Point3(0.6875, 0.75, -0.375));
  expect(f1.numVert).toBe(2);
  expect(f1.vertices[0]).toBe(v2orig); // the vertices don't change
});
