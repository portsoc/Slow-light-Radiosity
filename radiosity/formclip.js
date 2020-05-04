import Vector3 from './vector3.js';
import Vector4 from './vector4.js';

const MIN_VALUE = 1e-10;

export default class FormClip {
  constructor(clipper) {
    this.transMatrix = null;   // Transformation matrix 4x4
    this.clipper = clipper;    // (FormClipEdge) First face to clip against
    this.origin = null;        // Polygon center where we're looking from
    this.hv = new Vector4(0, 0, 0, 0); // temporary vector in homogeneous coordinates
  }

  isFacingAway(patch) {
    const view = new Vector3(
      patch.vertices[0].pos,
      this.origin,
    );
    return patch.normal.dot(view) < MIN_VALUE;
  }

  clip(elem, out) {
    out.reset();
    for (const vert of elem.vertices) {
      this.hv.setToProjection(vert.pos, this.transMatrix);
      this.clipper.clip(this.hv, out);
    }
    this.clipper.close(out);
    return out.numVert;
  }
}
