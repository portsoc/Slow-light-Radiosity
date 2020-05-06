import * as Rad from '../radiosity/index.js';
import * as sub from './subdivision.js';

/*
 * Create a new single face with side length 1 and the given reflectance/emittance.
 * The created face is in the XY plane and is facing upwards.
 * The face will be subdivided into `subdivide` x `subdivide` equal elements.
 */
export function singleFace(reflectance, emittance, subdivide = 1) {
  const p = [
    new Rad.Point3(0, 0, 0),
    new Rad.Point3(1, 0, 0),
    new Rad.Point3(1, 1, 0),
    new Rad.Point3(0, 1, 0),
  ];
  const v = p.map(p => new Rad.Vertex3(p));

  const patch = new Rad.Patch3(v, sub.quad(v, subdivide));

  const surface = new Rad.Surface3(reflectance, emittance, [patch]);

  return new Rad.Instance([surface]);
}
