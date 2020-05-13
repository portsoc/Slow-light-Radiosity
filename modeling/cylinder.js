import * as Rad from '../radiosity/index.js';
import * as sub from './subdivision.js';

/*
 * Create a new cylinder with bottom radius r1 and top radius r2, with height h.
 * It will have n sides, subdivided along z axis into `subdivide` elements.
 * The top and bottom are made up of quad elements (maybe one triangle) meeting in the middle.
 * The cylinder has three surfaces: top, sides, bottom.
 * The center of the bottom of the cylinder is at 0,0,0.
 */
export function cylinder(n = 8, r1 = 0.5, r2 = 0.5, h = 1, subdivide = 1) {
  const topPatches = circlePatches(n, r2, h, true);
  const bottomPatches = circlePatches(n, r1, 0, false);
  const sidePatches = cylinderSidePatches(n, r1, r2, h, subdivide, true);

  const surfaces = [
    new Rad.Surface3(null, null, topPatches),
    new Rad.Surface3(null, null, sidePatches),
    new Rad.Surface3(null, null, bottomPatches),
  ];

  return new Rad.Instance(surfaces);
}

/*
 * Create a new hollow cylinder with bottom radius r1 and top radius r2, with height h.
 * It will have n sides, subdivided along z axis into `subdivide` elements.
 * The cylinder has two surfaces: outside and inside.
 * The inside surface has `shrink`-times smaller radii.
 * The center of the bottom of the cylinder is at 0,0,0.
 *
 * This object has two disconnected surfaces, but usually that's not noticeable.
 */
export function lampshade(n = 8, r1 = 0.5, r2 = 0.5, h = 1, subdivide = 1, shrink = 0.999) {
  const outsidePatches = cylinderSidePatches(n, r1, r2, h, subdivide, true);
  const insidePatches = cylinderSidePatches(n, r1 * shrink, r2 * shrink, h, subdivide, false);

  const surfaces = [
    new Rad.Surface3(null, null, outsidePatches),
    new Rad.Surface3(null, null, insidePatches),
  ];

  return new Rad.Instance(surfaces);
}

// create an array of n points on a circle with radius r and center at 0,0,z
function circlePoints(n, r, z, ccw = true) {
  const dir = ccw ? 1 : -1;
  const retval = [];
  for (let i = 0; i < n; i += 1) {
    const a = Math.PI * 2 / n * i;
    const sin = Math.sin(a) * dir;
    const cos = Math.cos(a);
    retval.push(new Rad.Point3(cos * r, sin * r, z));
  }
  return retval;
}

// create patches that form a circle with n sides, with radius r
// they are quads (or one triangle) that meet at the center
function circlePatches(n, r, z, facingUp = true) {
  const points = circlePoints(n, r, z, facingUp);

  // bottom and top surface vertices
  const vertices = points.map(p => new Rad.Vertex3(p));

  const center = new Rad.Vertex3(new Rad.Point3(0, 0, z));

  const patches = [];

  // create the patches as quads, stepping by two vertices at a time
  for (let i = 0; i < n; i += 2) {
    const j = (i + 1) % n;
    if (j !== 0) {
      const k = (i + 2) % n;
      patches.push(new Rad.Patch3([center, vertices[i], vertices[j], vertices[k]]));
    } else {
      // we are on the last point, make a triangle
      patches.push(new Rad.Patch3([center, vertices[i], vertices[j]]));
    }
  }

  return patches;
}

// creates patches around a cylinder
function cylinderSidePatches(n, r1, r2, h, subdivide = 1, facingOut = true) {
  const patches = [];

  const bottomPoints = circlePoints(n, r1, 0, facingOut);
  const topPoints = circlePoints(n, r2, h, facingOut);

  // side vertices, bottom and top (different because surfaces cannot share vertices)
  const bottomV = bottomPoints.map(p => new Rad.Vertex3(p));
  const topV = topPoints.map(p => new Rad.Vertex3(p));

  // create side patches
  for (let i = 0; i < n; i += 1) {
    const j = (i + 1) % n;
    const face = [bottomV[i], bottomV[j], topV[j], topV[i]];
    patches.push(new Rad.Patch3(face, sub.quadElements(face, [1, subdivide])));
  }

  return patches;
}
