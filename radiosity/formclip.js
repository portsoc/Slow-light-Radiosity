import Vector3 from './vector3.js';
import Vector4 from './vector4.js';

const MIN_VALUE = 1e-10;

export default class FormClip {
  constructor() {
    this.transMatrix = null;   // Transformation matrix 4x4
    this.firstFace = null;     // First face (FormClipEdge) to clip against
    this.origin = null;        // Polygon center where we're looking from
  }

  isFacingAway(patch) {
    const view = new Vector3(
      patch.vertices[0].pos,
      this.origin,
    );
    return patch.normal.dot(view) < MIN_VALUE;
  }

  clip(elem, out, polyId) {
    out.reset(polyId);
    const hv = new Vector4(0, 0, 0, 0);
    for (const vert of elem.vertices) {
      hv.setToProjection(vert.pos, this.transMatrix);
      this.firstFace.clip(hv, out);
    }
    this.firstFace.close(out);
    return out.numPoints;
  }
}
