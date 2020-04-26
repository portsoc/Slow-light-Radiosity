import FormClipEdge from '../../radiosity/formclipedge.js';
import Vector4 from '../../radiosity/vector4.js';

test('intersect', () => {
  // very simple set of tests:
  // a line parallel to X at y=2, (z=w=0)
  // normals at X, 45°, and 1-to-2
  // intersect at 0, -2, and -1

  const s = new Vector4(-2, 2, 0, 0);
  const e = new Vector4(2, 2, 0, 0);

  const n1 = new Vector4(1, 0, 0, 0).normalize();
  const fce1 = new FormClipEdge(n1);
  expect(fce1.intersect(s, e)).toStrictEqual(new Vector4(0, 2, 0, 0));

  const n2 = new Vector4(1, 1, 0, 0).normalize();
  const fce2 = new FormClipEdge(n2);
  expect(fce2.intersect(s, e)).toStrictEqual(new Vector4(-2, 2, 0, 0));

  const n3 = new Vector4(2, 1, 0, 0).normalize();
  const fce3 = new FormClipEdge(n3);
  expect(fce3.intersect(s, e)).toStrictEqual(new Vector4(-1, 2, 0, 0));

  const s2 = new Vector4(-6, 2, 0, 0);
  const e2 = new Vector4(10, 2, 0, 0);
  expect(fce1.intersect(s2, e2)).toStrictEqual(new Vector4(0, 2, 0, 0));
  expect(fce2.intersect(s2, e2)).toStrictEqual(new Vector4(-2, 2, 0, 0));
  expect(fce3.intersect(s2, e2)).toStrictEqual(new Vector4(-1, 2, 0, 0));
});
