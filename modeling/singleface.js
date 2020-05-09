import * as Rad from '../radiosity/index.js';
import * as sub from './subdivision.js';

/*
 * Create a new single face with side length 1 and the given reflectance/emittance.
 * The created face is in the XY plane and is facing upwards.
 * The face will be subdivided into `subdivide[0]` x `subdivide[1]` equal elements.
 * If subdivide is a single number, it will be used for both directions.
 */
export function singleFace(reflectance, emittance, subdivide = [1, 1]) {
  const p = [
    new Rad.Point3(0, 0, 0),
    new Rad.Point3(1, 0, 0),
    new Rad.Point3(1, 1, 0),
    new Rad.Point3(0, 1, 0),
  ];
  const v = p.map(p => new Rad.Vertex3(p));

  const patch = new Rad.Patch3(v, sub.quadElements(v, subdivide));

  const surface = new Rad.Surface3(reflectance, emittance, [patch]);

  return new Rad.Instance([surface]);
}
