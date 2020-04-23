import Vector3 from './vector3.js';
import Vector4 from './vector4.js';

export default class FormClip { // No need to be abstract
  constructor() {
    this.MIN_VALUE = 1e-10;
    this.numVert = 0;                  // Number of polygone vertices
    this.u = this.v = this.n = null;   // View system co-ordinates
    this.transMatrix = [];             // Transformation matrix
    this.clippers = [];                 // Clipper array
    this.center = null;                // Polygone center
  }

  static randomVector3() {
    return new Vector3(
      Math.rand() * 2 - 1,
      Math.rand() * 2 - 1,
      Math.rand() * 2 - 1,
    );
  }

  backFaceCull(patch) {
    const view = new Vector3(
      patch.vertices[0].pos,
      this.center,
    );
    return patch.normal.dot(view) < this.MIN_VALUE;
  }

  clip(elem, out, polyId) {
    out.reset(polyId);
    const hv = new Vector4(0, 0, 0, 0);
    for (const vert of elem.vertices) {
      hv.projTransform(vert.pos);
      this.clippers[0].clip(hv, out);
    }
    this.clippers[0].close(out);
    return out.numVert;
  }
}
