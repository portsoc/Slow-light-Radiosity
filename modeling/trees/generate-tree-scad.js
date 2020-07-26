import { Point, P } from './point.js';
import seedrandom from 'seedrandom';
const rng = seedrandom(2);


const lib = [];

lib.push('use <lib.scad>;');
lib.push(`
  module triangle(x, y) {
    mirror([0,0,1])
    linear_extrude(0.1, scale=0)
    polygon([
      [x, 0],
      [0, y/2],
      [0, -y/2]
    ]);
  };
  `);

function scadBranch(p1, p2, w = 1) {
  return `
    color("brown")
    hull() {
      ${scadPoint(p1, w)}
      ${scadPoint(p2, w)}
    };
  `;
}

function scadPoint(p, w = 1) {
  return `
    translate(${p.toScad()})
    octahedron(${w});
  `;
}

function scadLeaf(p) {
  if (p.prev == null) return '';

  const v = p.minus(p.prev);
  const a = Math.atan2(v.y, v.x) / Math.PI * 180;

  return `
    color("green")
    translate(${p.toScad()})
    rotate([0,20,${a}])
    triangle(12,8);
  `;
}

function hollowSphereAttractionPoints(n = 100, r = 5, center = new Point(0, 0, 6), hollowing = 0) {
  const retval = [];
  while (retval.length < n) {
    const p = center.plus(P(rand0(r), rand0(r), rand0(r)));
    const dist = p.dist(center);
    const allowedDist = typeof hollowing === 'function' ? hollowing() : hollowing;
    if (dist <= r && allowedDist < dist / r) retval.push(p);
  }
  return retval;
}

function hollowHalfSphereAttractionPoints(n = 100, r = 5, center = new Point(0, 0, 6), hollowing = 0) {
  const retval = [];
  while (retval.length < n) {
    const p = center.plus(P(rand0(r), rand0(r), rand(r)));
    const dist = p.dist(center);
    const allowedDist = typeof hollowing === 'function' ? hollowing() : hollowing;
    if (dist <= r && allowedDist < dist / r) retval.push(p);
  }
  return retval;
}

function nRandomSpheres(nSpheres, N, r) {
  return [
    hollowSphereAttractionPoints(N, r, P(0, 0, r * 3)),
    hollowSphereAttractionPoints(N, r, P(r, r, r * 2.5)),
    hollowSphereAttractionPoints(N, r, P(r, -r, r * 2)),
    hollowSphereAttractionPoints(N, r, P(-r, r, r * 2)),
    hollowSphereAttractionPoints(N, r, P(-r, -r, r * 2.5)),
    hollowSphereAttractionPoints(N / 2, r / 2, P(0, 0, r * 1.5)),
  ].flat(1);
}

function randomHollowing() {
  return Math.sqrt(rand());
}

function rand(x = 1) {
  return rng() * x;
}

function rand0(x) {
  return rand(x * 2) - x;
}

function growTree(state, D, di, dk) {
  // copy state so we don't mutate it
  const tree = Array.from(state.tree);

  const pointsPerTreeNode = assignPointsToClosestNodes(state.points, tree, di);

  for (let i = 0; i < tree.length; i += 1) {
    const treeNode = tree[i];
    const influencingPoints = pointsPerTreeNode[i];

    if (!influencingPoints || influencingPoints.length === 0) continue;

    const towards = selectHalfSphere(treeNode, influencingPoints);
    const newNode = nextBranchNode(treeNode, towards, D);
    newNode.prev = treeNode;

    tree.push(newNode);
  }

  // filter out points that are within kill distance `dk` from the tree
  const points = pointsOutsideKillDistance(state.points, tree, dk);

  return { tree, points };
}

// select only a half-sphere of points from the given array
// it's the half-sphere that points towards points[0]
function selectHalfSphere(node, points) {
  let maxPoint = points[0];
  let maxDist = -Infinity;

  for (const point of points) {
    const dist = node.dist(point);
    if (dist > maxDist) {
      maxPoint = point;
      maxDist = dist;
    }
  }

  const v0 = maxPoint.minus(node);
  return points.filter(p => p.minus(node).dot(v0) >= 0);
}

function nextBranchNode(node, points, D) {
  const v = averageNormVector(node, points);
  const towardsPoints = v.scale(D);

  return node.plus(towardsPoints);

  // if (node.prev == null) return node.plus(towardsPoints);
  //
  // // if we have a previous node, decrease the angle of the new branch
  // const dirFromPrev = node.minus(node.prev);
  // return node.plus(towardsPoints.plus(dirFromPrev).div(2));
}

function pointsOutsideKillDistance(points, nodes, dk) {
  return points.filter(p => nodes.every(n => n.dist(p) > dk));
}

// compute average of the unit vectors from origin to each of the given points
function averageNormVector(origin, points) {
  let sum = P(0, 0, 0);

  for (const p of points) {
    const v = p.minus(origin).norm();
    sum = sum.plus(v);
  }

  return sum.norm();
}

function assignPointsToClosestNodes(points, nodes, di) {
  const retval = nodes.map(() => []);

  for (const point of points) {
    let nearestIndex = null;
    let nearestDist = Infinity;

    for (let i = 0; i < nodes.length; i += 1) {
      const node = nodes[i];
      const dist = node.dist(point);
      if (dist < nearestDist) {
        nearestIndex = i;
        nearestDist = dist;
      }
    }

    if (nearestDist < di && nearestIndex != null) {
      retval[nearestIndex].push(point);
    }
  }

  return retval;
}

function calculateBranchNexts(tree) {
  for (const node of tree) {
    node.nexts = [];
    if (node.prev) {
      node.prev.nexts.push(node);
    }
  }
}

function calculateBranchThicknesses(tree, defaultThickness = 1) {
  const POWER = 3;

  // tree is partially ordered from root to leaves
  // so we can go through the tree from the back
  for (let i = tree.length - 1; i >= 0; i -= 1) {
    const node = tree[i];
    if (node.crossSectionArea) {
      node.thickness = node.crossSectionArea ** (1 / POWER);
    } else {
      node.thickness = defaultThickness;
    }

    const prev = node.prev;
    if (prev) {
      if (prev.crossSectionArea == null) prev.crossSectionArea = 0;
      prev.crossSectionArea += node.thickness ** POWER;
    }
  }
}

function decimateTree(tree) {
  calculateBranchNexts(tree);
  const toRemove = [];
  for (const node of tree) {
    if (node.prev && node.nexts.length === 1) {
      toRemove.push(node);
      node.nexts[0].prev = node.prev;
    }
  }

  return tree.filter(node => !toRemove.includes(node));
}

function relocateNodes(tree, fraction = 0.5) {
  for (let i = tree.length - 1; i >= 0; i -= 1) {
    const node = tree[i];
    if (node.prev) {
      const newNode = node.prev.towardsFract(node, fraction);
      node.setTo(newNode);
    }
  }
}

function selectLeaves(tree) {
  return tree.filter(node => node.nexts.length === 0);
}

function makeTree() {
  const base = P(0, 0, 0);

  const r = 60;
  const trunk = 20;
  const D = 1;

  const N = 10000;
  const hollowing = randomHollowing;

  const di = 1500 * D; // radius of influence
  const dk = 6 * D; // kill distance

  const maxStep = 1000;

  // const points = hollowSphereAttractionPoints(N, r, base.plus(P(0, 0, trunk + r)), hollowing);
  const points = hollowHalfSphereAttractionPoints(N, r, base.plus(P(0, 0, trunk)), hollowing);
  // const points = nRandomSpheres(5, N, r);

  let state = {
    points,
    tree: [base],
  };

  let step = 0;
  while ((step += 1) < maxStep) {
    state = growTree(state, D, di, dk);
    if (state.points.length === 0) break;
  }
  console.error({ step });

  const finalTree = decimateTree(state.tree);

  relocateNodes(finalTree, 0.7);
  calculateBranchThicknesses(finalTree, 0.2);

  console.error(finalTree.length);

  return [
    finalTree.map(p => p.prev != null ? scadBranch(p.prev, p, p.thickness) : []),
    selectLeaves(finalTree).map(p => scadLeaf(p)),
    // finalTree.map(p => scadPoint(p)),
    // points.map(p => scadPoint(p)),
  ];
}

function main() {
  console.log(lib.join('\n'));
  console.log(makeTree().flat(Infinity).join('\n'));
}

main();
