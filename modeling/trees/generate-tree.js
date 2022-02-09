/*
Generate a tree.
This is the main script, it does three things:

1. generate random points in a shape where the tree should have its crown (using shapes.js)
2. grow a gree into that shape (using tree-generator.js)
3. output the tree into stdout

Additionally, a bit of statistics is output into stderr.
*/

import * as output from './scad-output.js';
import * as trees from './tree-generator.js';
import * as shapes from './shapes.js';
import { P } from './point.js';

function main() {
  const r = 60;
  const trunk = 30;

  const N = 10000;
  const hollowing = shapes.randomHollowing; // makes the generated sphere or half-sphere less dense inside

  const points = shapes.hollowSphereAttractionPoints(N, r, P(0, 0, trunk + r), hollowing);
  // const points = shapes.hollowHalfSphereAttractionPoints(N, r, P(0, 0, trunk), hollowing);
  // const points = shapes.nRandomSpheres(5, 1000, r);

  const tree = trees.makeTree(points, {
    D: 1,
    di: (r + trunk) * 0.8, // radius of influence
    dk: 6, // kill distance
    relocateFraction: 0.2, // how much down the branch towards the root should every point move
    minThickness: 0.2, // how thick should the smallest branches be
    thicknessPower: 2, // bigger power means smaller branches are closer in thickness to parent branches
    maxStep: 1000,
  });

  const leaves = trees.selectLeaves(tree);
  console.log(output.toString(tree, leaves));
}

main();
