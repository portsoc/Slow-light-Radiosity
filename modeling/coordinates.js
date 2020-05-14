/*
 * For modeling, we use right-hand coordinates that put X and Y on the floor, and Z upwards.
 * We can call this the xyFloor coordinate system.
 *
 * Three.js, on the other hand, uses right-hand coordinates where X and Y are on the screen
 * (rightwards and upwards) and Z is towards the user/camera. We can call this the view
 * coordinate system.
 */

// transform an environment from xyFloor coordinates to view coordinates.
export function xyFloorToView(env) {
  for (const vertex of env.vertices) {
    const tmp = vertex.pos.z;
    vertex.pos.z = -vertex.pos.y;
    vertex.pos.y = tmp;
  }

  return this;
}
