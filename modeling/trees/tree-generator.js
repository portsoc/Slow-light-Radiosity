// follows space colonisation algorithm as described in
// http://algorithmicbotany.org/papers/colonization.egwnp2007.large.pdf

// a tree is an array of nodes
// a node is a point that may have a previous node "prev" towards the root (the root doesn't have prev)
// and a node may have "nexts" – an array of branches coming out of this node

import { P } from './point.js';

// in every step, the attraction points make their nearest tree node sprout a new node towards them
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

let checkFromNodeIndex = 0;

function assignPointsToClosestNodes(points, nodes, di) {
  // OPTIMIZATION WARNING:
  // assumptions: while growTree is being called
  //   nodes already in tree never move inside the tree array
  //   and they never move in space
  // remember how many nodes we had last time
  // every point remember closest node and distance
  // for every point, only check the distance to new nodes

  const retval = nodes.map(() => []);

  for (const point of points) {
    let nearestIndex = point.nearestIndex ?? null;
    let nearestDist = point.nearestDist ?? Infinity;

    for (let i = checkFromNodeIndex; i < nodes.length; i += 1) {
      const node = nodes[i];
      const dist = node.dist(point);
      if (dist < nearestDist) {
        nearestIndex = i;
        nearestDist = dist;
      }
    }

    point.nearestIndex = nearestIndex;
    point.nearestDist = nearestDist;

    if (nearestDist < di && nearestIndex != null) {
      retval[nearestIndex].push(point);
    }
  }

  checkFromNodeIndex = nodes.length;

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

// leaf branches all have the same thickness
// a branch has a cross-section calculated by adding the cross-sections of its sub-branches
// cross-section = thickness ^ power
function calculateBranchThicknesses(tree, defaultThickness = 1, power = 3) {
  // tree is partially ordered from root to leaves
  // so we can go through the tree from the back
  for (let i = tree.length - 1; i >= 0; i -= 1) {
    const node = tree[i];
    if (node.crossSectionArea) {
      node.thickness = node.crossSectionArea ** (1 / power);
    } else {
      node.thickness = defaultThickness;
    }

    const prev = node.prev;
    if (prev) {
      if (prev.crossSectionArea == null) prev.crossSectionArea = 0;
      prev.crossSectionArea += node.thickness ** power;
    }
  }
}

// remove all intermediary nodes between branching points
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

// move every nodes towards the parent node, this makes the tree look a bit better
// the tree shrinks a bit in the process
function relocateNodes(tree, fractionTowardsPrev = 0.5) {
  // take last nodes first so the relocation moves don't compound
  for (let i = tree.length - 1; i >= 0; i -= 1) {
    const node = tree[i];
    if (node.prev) {
      const newNode = node.prev.towardsFract(node, 1 - fractionTowardsPrev);
      node.setTo(newNode);
    }
  }
}

// returns all the leaf nodes of the given tree
export function selectLeaves(tree) {
  return tree.filter(node => node.nexts.length === 0);
}

const DEFAULT_OPTS = {
  D: 1,
  di: 1500, // radius of influence
  dk: 6, // kill distance
  relocateFraction: 0.3, // how much down the branch towards the root should every point move
  minThickness: 0.2, // how thick should the smallest branches be
  thicknessPower: 3, // bigger power means smaller branches are closer in thickness to parent branches
  maxStep: 1000,
  displayStats: console.error, // how to show stats, if at all
};

export function makeTree(points, opts) {
  const base = P(0, 0, 0);

  // reset the optimization of assignPointsToClosestNodes() so makeTree() can be reused
  checkFromNodeIndex = 0;

  opts = Object.assign({}, DEFAULT_OPTS, opts);
  const {
    D,
    di,
    dk,
    relocateFraction,
    minThickness,
    maxStep,
    thicknessPower,
  } = opts;

  const displayStats = opts.displayStats ?? (() => {});

  let state = {
    points,
    tree: [base],
  };

  let step = 0;
  while ((step += 1) < maxStep && state.points.length > 0) {
    state = growTree(state, D, di, dk);
  }

  displayStats({ step });

  const finalTree = decimateTree(state.tree);

  relocateNodes(finalTree, relocateFraction);
  calculateBranchThicknesses(finalTree, minThickness, thicknessPower);

  displayStats({ nodeCount: finalTree.length });

  return finalTree;
}
