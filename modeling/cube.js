import * as Rad from '../radiosity/index.js';
import * as sub from './subdivision.js';

/*
 * Create a new cube with side length 1 and the given reflectance/emittance.
 * Each side will be subdivided into `subdivide` x `subdivide` equal elements.
 * z ^ 7-----6
 *   |/|    /|
 *   4-+---5 |
 *   | |/y | |
 *   | 3---+-2
 *   |/    |/
 *   0-----1 --> x
 */
export function unitCube(reflectance, emittance, subdivide = [1, 1, 1], subPatches = false) {
  if (typeof subdivide === 'number') {
    subdivide = [subdivide, subdivide, subdivide]; // subdivision along the X,Y,Z axes
  }

  const [subx, suby, subz] = subdivide;

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

  const subs = [
    [subx, subz], // front
    [subx, subz], // back
    [suby, subz], // right
    [subz, suby], // left
    [subx, suby], // top
    [suby, subx], // bottom
  ];

  const patches = [];
  for (let i = 0; i < 6; i += 1) {
    const face = faces[i];
    const faceSub = subs[i];

    if (subPatches) {
      // generate multiple patches for the face
      patches.push(...sub.quadPatches(face, faceSub));
    } else {
      // generate a single patch with subdivision in elements
      patches.push(new Rad.Patch3(face, sub.quadElements(face, faceSub)));
    }
  }

  const surface = new Rad.Surface3(reflectance, emittance, patches);

  return new Rad.Instance([surface]);
}

/*
 * Create a unit cube whose every side is a separate surface;
 * reflectances and emittances are all default (black) Spectra().
 * Each side will be subdivided into `subdivide` x `subdivide` equal elements.
 * The sides are in order of front (standing on x), back, right, left, top, bottom.
 * z ^ 7-----6
 *   |/|    /|
 *   4-+---5 |
 *   | |/y | |
 *   | 3---+-2
 *   |/    |/
 *   0-----1 --> x
 */
export function unitCubeMultiSurface(subdivide = 1, subPatches = false) {
  if (typeof subdivide === 'number') {
    subdivide = [subdivide, subdivide, subdivide]; // subdivision along the X,Y,Z axes
  }

  const [subx, suby, subz] = subdivide;

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
    surfaceFromPoints([p[0], p[1], p[5], p[4]], [subx, subz], subPatches), // front
    surfaceFromPoints([p[2], p[3], p[7], p[6]], [subx, subz], subPatches), // back
    surfaceFromPoints([p[1], p[2], p[6], p[5]], [suby, subz], subPatches), // right
    surfaceFromPoints([p[0], p[4], p[7], p[3]], [subz, suby], subPatches), // left
    surfaceFromPoints([p[4], p[5], p[6], p[7]], [subx, suby], subPatches), // top
    surfaceFromPoints([p[0], p[3], p[2], p[1]], [suby, subx], subPatches), // bottom
  ];

  return new Rad.Instance(surfaces);
}

function surfaceFromPoints(points, subdivide, subPatches) {
  // surfaces don't share vertices, need to create new vertices each time
  const vertices = points.map(p => new Rad.Vertex3(p));

  // the patch automatically gets its own default element
  const patches = [];

  if (subPatches) {
    // generate multiple patches for the face
    patches.push(...sub.quadPatches(vertices, subdivide));
  } else {
    // generate a single patch with subdivision in elements
    patches.push(new Rad.Patch3(vertices, sub.quadElements(vertices, subdivide)));
  }

  return new Rad.Surface3(null, null, patches);
}
