import * as Rad from '../radiosity/index.js';
import * as sub from './subdivision.js';

/*
 * Create a new cube with side length 1 and the given reflectance/emittance.
 * Each side will be subdivided into `subdivide` x `subdivide` equal elements.
 *   7-----6
 *  /|    /|
 * 4-+---5 |
 * | |   | |
 * | 3---+-2
 * |/    |/
 * 0-----1
 */
export function unitCube(reflectance, emittance, subdivide = 1) {
  const p = [
    new Rad.Point3(0, 0, 0),
    new Rad.Point3(1, 0, 0),
    new Rad.Point3(1, 1, 0),
    new Rad.Point3(0, 1, 0),
    new Rad.Point3(0, 0, 1),
    new Rad.Point3(1, 0, 1),
    new Rad.Point3(1, 1, 1),
    new Rad.Point3(0, 1, 1),
  ];
  const v = p.map(p => new Rad.Vertex3(p));

  const faces = [
    [v[0], v[1], v[5], v[4]], // front
    [v[2], v[3], v[7], v[6]], // back
    [v[1], v[2], v[6], v[5]], // right
    [v[0], v[4], v[7], v[3]], // left
    [v[4], v[5], v[6], v[7]], // top
    [v[0], v[3], v[2], v[1]], // bottom
  ];

  const patches = faces.map(face => new Rad.Patch3(face, sub.quad(face, subdivide)));

  const surface = new Rad.Surface3(reflectance, emittance, patches);

  return new Rad.Instance([surface]);
}

/*
 * Create a unit cube whose every side is a separate surface;
 * reflectances and emittances are all default (black) Spectra().
 * Each side will be subdivided into `subdivide` x `subdivide` equal elements.
 */
export function unitCubeMultiSurface(subdivide = 1) {
  const p = [
    new Rad.Point3(0, 0, 0),
    new Rad.Point3(1, 0, 0),
    new Rad.Point3(1, 1, 0),
    new Rad.Point3(0, 1, 0),
    new Rad.Point3(0, 0, 1),
    new Rad.Point3(1, 0, 1),
    new Rad.Point3(1, 1, 1),
    new Rad.Point3(0, 1, 1),
  ];

  const surfaces = [
    surfaceFromPoints([p[0], p[1], p[5], p[4]], subdivide), // front
    surfaceFromPoints([p[2], p[3], p[7], p[6]], subdivide), // back
    surfaceFromPoints([p[1], p[2], p[6], p[5]], subdivide), // right
    surfaceFromPoints([p[0], p[4], p[7], p[3]], subdivide), // left
    surfaceFromPoints([p[4], p[5], p[6], p[7]], subdivide), // top
    surfaceFromPoints([p[0], p[3], p[2], p[1]], subdivide), // bottom
  ];

  return new Rad.Instance(surfaces);
}

function surfaceFromPoints(points, subdivide) {
  // surfaces don't share vertices, need to create new vertices each time
  const vertices = points.map(p => new Rad.Vertex3(p));

  // the patch automatically gets its own default element
  const patch = new Rad.Patch3(vertices, sub.quad(vertices, subdivide));

  return new Rad.Surface3(null, null, [patch]);
}
