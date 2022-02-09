/*
This module turns trees into an OpenSCAD representation.

The main function is toString(tree, leaves).

Branches are sticks generated as a hull getween two octahedrons in the end-points.

Leaves are triangles (well, very flat pyramids).
Each leaf is oriented off-horizontal (to catch the sun) and in the horizontal direction of its branch

The sizing of leaves, branches etc. could be parametric.

OpenSCAD has to generate enclosed solids, but if we didn't have to do that, we could simplify the structure:
 - a branch might be a triangular-cross-section tube without end-faces (3 rectangles, or 6 triangles total)
 - a leaf might be simply two triangle surfaces very close to one another, facing in opposite directions (same vertices in reverse order), basically flat
*/

const BRANCH_COLOR = 'brown';
const LEAF_COLOR = 'green';

const SCAD_MODULES = `
  // the base square has size d
  module octahedron(d) {
    rotate(45) {
      linear_extrude(d/sqrt(2), scale=0)
      square(d, center=true);

      mirror([0,0,1])
      linear_extrude(d/sqrt(2), scale=0)
      square(d, center=true);
    }
  }

  module triangle(x, y) {
    mirror([0,0,1])
    linear_extrude(0.1, scale=0)
    polygon([
      [x, 0],
      [0, y/2],
      [0, -y/2]
    ]);
  };
`;

function scadBranch(p1, p2, w = 1) {
  return `
    color("${BRANCH_COLOR}")
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
    color("${LEAF_COLOR}")
    translate(${p.toScad()})
    rotate([0,20,${a}])
    triangle(12,8);
  `;
}

export function toString(tree = [], leaves = [], includeModules = true) {
  const retval = [];

  if (includeModules) retval.push(SCAD_MODULES);

  // for every node in a tree, generate a "branch" between the previous node and this one
  for (const node of tree) {
    if (node.prev != null) {
      retval.push(scadBranch(node.prev, node, node.thickness));
    }
  }

  // generate leaves
  for (const leaf of leaves) {
    retval.push(scadLeaf(leaf));
  }

  return retval.join('\n');
}
