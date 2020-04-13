import * as Rad from '../radiosity/index.js';

/*
 * create a new cube with side length 1 and the given reflectance/emittance
 *   7-----6
 *  /|    /|
 * 4-+---5 |
 * | |   | |
 * | 3---+-2
 * |/    |/
 * 0-----1
 */
export function unitCube(reflectance, emittance) {
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

  const patches = [
    new Rad.Patch3([v[0], v[1], v[5], v[4]]), // front
    new Rad.Patch3([v[2], v[3], v[7], v[6]]), // back
    new Rad.Patch3([v[1], v[2], v[6], v[5]]), // right
    new Rad.Patch3([v[0], v[4], v[7], v[3]]), // left
    new Rad.Patch3([v[4], v[5], v[6], v[7]]), // top
    new Rad.Patch3([v[0], v[3], v[2], v[1]]), // bottom
  ];
  // each patch automatically gets its own default element

  const surface = new Rad.Surface3(reflectance, emittance, patches);

  return new Rad.Instance([surface]);
}

/*
 * create a unit cube whose every side is a separate surface;
 * reflectances and emittances are all default (black) Spectra()
 */
export function unitCubeMultiSurface() {
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
    surfaceFromPoints([p[0], p[1], p[5], p[4]]), // front
    surfaceFromPoints([p[2], p[3], p[7], p[6]]), // back
    surfaceFromPoints([p[1], p[2], p[6], p[5]]), // right
    surfaceFromPoints([p[0], p[4], p[7], p[3]]), // left
    surfaceFromPoints([p[4], p[5], p[6], p[7]]), // top
    surfaceFromPoints([p[0], p[3], p[2], p[1]]), // bottom
  ];

  return new Rad.Instance(surfaces);
}

function surfaceFromPoints(points) {
  // surfaces don't share vertices, need to create new vertices each time
  const vertices = points.map(p => new Rad.Vertex3(p));

  // the patch automatically gets its own default element
  const patch = new Rad.Patch3(vertices);

  return new Rad.Surface3(null, null, [patch]);
}
