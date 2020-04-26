import FormClip from './formclip.js';
import Vector4 from './vector4.js';
import Vector3 from './vector3.js';

const EYE = -1;
const FPD = -0.99;
const BPD = 1e10;
const SN = (EYE - BPD) * (EYE - FPD) / (EYE * EYE * (BPD - FPD));
const RN = FPD * (EYE - BPD) / (EYE * (FPD - BPD));

export default class HemiClip extends FormClip {
  constructor() {
    super();
    // Link edge-plane clippers
    this.clippers.FRONT.add(this.clippers.LEFT);
    this.clippers.LEFT.add(this.clippers.RIGTH);
    this.clippers.RIGTH.add(this.clippers.TOP);
    this.clippers.TOP.add(this.clippers.BOTTOM);
    this.clippers.BOTTOM.add(null);
    // Set clipper plane normals
    let tmp;
    tmp = new Vector4(0, 0, 1, 0);
    this.clippers.FRONT.normal = tmp.normalize();
    tmp = new Vector4(1, 0, 0, 0);
    this.clippers.LEFT.normal = tmp.normalize();
    tmp = new Vector4(-1, 0, 0, 1);
    this.clippers.RIGTH.normal = tmp.normalize();
    tmp = new Vector4(0, -1, 0, 1);
    this.clippers.TOP.normal = tmp.normalize();
    tmp = new Vector4(0, 1, 0, 0);
    this.clippers.BOTTOM.normal = tmp.normalize();
  }

  setView(patch) {
    this.center = patch.center;
    this.n = patch.normal;
    do {
      this.u = this.n.cross(Vector3.random());
    } while (this.u.length < this.MIN_VALUE);
    this.u.normalize();
    this.v = this.u.cross(this.n);
    return this;
  }

  buildTransform(u, v, n) {
    const origin = new Vector3(this.center);
    // Set view transformation matrix
    this.transMatrix[0][0] = u.pos.x;
    this.transMatrix[0][1] = u.pos.y;
    this.transMatrix[0][2] = u.pos.z;
    this.transMatrix[0][3] = -origin.dot(u);
    this.transMatrix[1][0] = v.pos.x;
    this.transMatrix[1][1] = v.pos.y;
    this.transMatrix[1][2] = v.pos.z;
    this.transMatrix[1][3] = -origin.dot(v);
    this.transMatrix[2][0] = n.pos.x;
    this.transMatrix[2][1] = n.pos.y;
    this.transMatrix[2][2] = n.pos.z;
    this.transMatrix[2][3] = -origin.dot(n);
    this.transMatrix[3][0] = 0;
    this.transMatrix[3][1] = 0;
    this.transMatrix[3][2] = 0;
    this.transMatrix[3][3] = 1;
    // Premultiply by translation matrix
    this.transMatrix[2][3] -= 1;
    // Premultiply by perspective transformation matrix
    this.transMatrix[3][0] += this.transMatrix[2][0];
    this.transMatrix[3][1] += this.transMatrix[2][1];
    this.transMatrix[3][2] += this.transMatrix[2][2];
    this.transMatrix[3][3] += this.transMatrix[2][3];
    // Premultiply by normalization matrix
    this.transMatrix[0][0] = 0.5 * (this.transMatrix[0][0] + this.transMatrix[3][0]);
    this.transMatrix[0][1] = 0.5 * (this.transMatrix[0][1] + this.transMatrix[3][1]);
    this.transMatrix[0][2] = 0.5 * (this.transMatrix[0][2] + this.transMatrix[3][2]);
    this.transMatrix[0][3] = 0.5 * (this.transMatrix[0][3] + this.transMatrix[3][3]);
    this.transMatrix[1][0] = 0.5 * (this.transMatrix[1][0] + this.transMatrix[3][0]);
    this.transMatrix[1][1] = 0.5 * (this.transMatrix[1][1] + this.transMatrix[3][1]);
    this.transMatrix[1][2] = 0.5 * (this.transMatrix[1][2] + this.transMatrix[3][2]);
    this.transMatrix[1][3] = 0.5 * (this.transMatrix[1][3] + this.transMatrix[3][3]);
    this.transMatrix[2][0] = SN * this.transMatrix[2][0] + RN * this.transMatrix[3][0];
    this.transMatrix[2][1] = SN * this.transMatrix[2][1] + RN * this.transMatrix[3][1];
    this.transMatrix[2][2] = SN * this.transMatrix[2][2] + RN * this.transMatrix[3][2];
    this.transMatrix[2][3] = SN * this.transMatrix[2][3] + RN * this.transMatrix[3][3];
  }

  updateView(faceId) {
    let u, v, n;
    switch (faceId) {
      case this.Plane.TOP:
        u = this.u; v = this.v; n = this.n;
        break;
      case this.Plane.FRONT:
        u = -this.u; v = this.n; n = this.v;
        break;
      case this.Plane.RIGHT:
        u = this.v; v = this.n; n = this.u;
        break;
      case this.Plane.BOTTOM:
        u = this.u; v = this.n; n = -this.v;
        break;
      case this.Plane.LEFT:
        u = -this.v; v = this.n; n = -this.u;
        break;
    }
    this.buildTransform(u, v, n);
  }
}
