// This file has functions that generate random points in various shapes.
// The points are then fed to tree-generator.js to grow a tree from them.

import { Point, P } from './point.js';
import seedrandom from 'seedrandom';
const rng = seedrandom(2);

export function hollowSphereAttractionPoints(n = 100, r = 5, center = new Point(0, 0, 6), hollowing = 0) {
  const retval = [];
  while (retval.length < n) {
    const p = center.plus(P(rand0(r), rand0(r), rand0(r)));
    const dist = p.dist(center);
    const allowedDist = typeof hollowing === 'function' ? hollowing() : hollowing;
    if (dist <= r && allowedDist < dist / r) retval.push(p);
  }
  return retval;
}

export function hollowHalfSphereAttractionPoints(n = 100, r = 5, center = new Point(0, 0, 6), hollowing = 0) {
  const retval = [];
  while (retval.length < n) {
    const p = center.plus(P(rand0(r), rand0(r), rand(r)));
    const dist = p.dist(center);
    const allowedDist = typeof hollowing === 'function' ? hollowing() : hollowing;
    if (dist <= r && allowedDist < dist / r) retval.push(p);
  }
  return retval;
}

export function nRandomSpheres(nSpheres, N, r) {
  return [
    hollowSphereAttractionPoints(N, r, P(0, 0, r * 3)),
    hollowSphereAttractionPoints(N, r, P(r, r, r * 2.5)),
    hollowSphereAttractionPoints(N, r, P(r, -r, r * 2)),
    hollowSphereAttractionPoints(N, r, P(-r, r, r * 2)),
    hollowSphereAttractionPoints(N, r, P(-r, -r, r * 2.5)),
    hollowSphereAttractionPoints(N / 2, r / 2, P(0, 0, r * 1.5)),
  ].flat(1);
}

export function randomHollowing() {
  return Math.sqrt(rand());
}

function rand(x = 1) {
  return rng() * x;
}

function rand0(x) {
  return rand(x * 2) - x;
}
