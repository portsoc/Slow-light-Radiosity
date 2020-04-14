import Instance from '../../radiosity/instance.js';
import Surface3 from '../../radiosity/surface3.js';
import Point3 from '../../radiosity/point3.js';
import Patch3 from '../../radiosity/patch3.js';
import Vertex3 from '../../radiosity/vertex3.js';
import Spectra from '../../radiosity/spectra.js';

test('constructor', () => {
  const s1 = new Surface3(null, null, []);
  const i1 = new Instance([s1]);
  expect(i1.surfaces).toStrictEqual([s1]);
});

/*
 * ^ y
 * |
 * 7 ----- 6 ----- 5 ----- 4
 * |   p   |   p   |   p   |
 * |   1   |   2   |   3   |
 * 0 ----- 1 ----- 2 ----- 3  -> x
 */
test('get vertices', () => {
  const points = [
    new Point3(0, 0, 0),
    new Point3(1, 0, 0),
    new Point3(2, 0, 0),
    new Point3(3, 0, 0),
    new Point3(3, 1, 0),
    new Point3(2, 1, 0),
    new Point3(1, 1, 0),
    new Point3(0, 1, 0),
  ];
  const vertices = points.map(p => new Vertex3(p));
  const p1 = new Patch3(select(vertices, 0, 1, 6, 7));
  const p2 = new Patch3(select(vertices, 1, 2, 5, 6));
  const p3 = new Patch3(select(vertices, 2, 3, 4, 5));
  const s1 = new Surface3(new Spectra(1, 2, 3), new Spectra(), [p1, p2, p3]);
  const i1 = new Instance([s1]);
  expect(i1.surfaces).toStrictEqual([s1]);

  // check the instance's vertices are the same (except for order)
  // to the ones provided above
  const i1Vertices = i1.vertices;
  expect(i1Vertices).toStrictEqual(expect.arrayContaining(vertices));
  expect(vertices).toStrictEqual(expect.arrayContaining(i1Vertices));
});

function select(arr, ...indices) {
  const retval = [];
  for (const i of indices) {
    retval.push(arr[i]);
  }
  return retval;
}
