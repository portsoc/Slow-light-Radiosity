import Surface3 from '../../radiosity/surface3.js';
import Point3 from '../../radiosity/point3.js';
import Patch3 from '../../radiosity/patch3.js';
import Vertex3 from '../../radiosity/vertex3.js';
import Spectra from '../../radiosity/spectra.js';

test('constructor', () => {
  const points = [
    new Point3(0, 0, 0),
    new Point3(1, 0, 0),
    new Point3(1, 1, 0),
    new Point3(0, 1, 0),
  ];
  const vertices = points.map(p => new Vertex3(p));
  const p1 = new Patch3(vertices);
  expect(p1.parentSurface).toBeNull();

  const s1 = new Surface3(new Spectra(1, 2, 3), new Spectra(), [p1]);
  expect(p1.parentSurface).toBe(s1);
});

test('reflectance and emittance', () => {
  const black = new Spectra(0, 0, 0);
  const color = new Spectra(1, 2, 3);

  const s1 = new Surface3(new Spectra(1, 2, 3), new Spectra(), []);
  expect(s1.reflectance).toStrictEqual(color);
  expect(s1.emittance).toStrictEqual(black);

  const s2 = new Surface3(null, null, []);
  expect(s2.reflectance).toStrictEqual(black);
  expect(s2.emittance).toStrictEqual(black);

  const s3 = new Surface3(black, color, []);
  expect(s3.reflectance).not.toBe(black);
  expect(s3.emittance).not.toBe(color);
  expect(s3.reflectance).toStrictEqual(black);
  expect(s3.emittance).toStrictEqual(color);
});
