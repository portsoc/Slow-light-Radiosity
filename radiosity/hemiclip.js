import FormClip from './formclip.js';
import FormClipEdge from './formclipedge.js';
import Vector4 from './vector4.js';
import Vector3 from './vector3.js';

const EYE = -1;
const FPD = -0.99;
const BPD = 1e10;
const SN = (EYE - BPD) * (EYE - FPD) / (EYE * EYE * (BPD - FPD));
const RN = FPD * (EYE - BPD) / (EYE * (FPD - BPD));

export const TOP = Symbol('hemicube top face');
export const FRONT = Symbol('hemicube front face');
export const RIGHT = Symbol('hemicube right face');
export const BACK = Symbol('hemicube back face');
export const LEFT = Symbol('hemicube left face');

export const FACES = [TOP, FRONT, RIGHT, BACK, LEFT];

export default class HemiClip extends FormClip {
  constructor() {
    // Set up clipper planes
    const front = new FormClipEdge(new Vector4(0, 0, 1, 0).normalize());
    const left = new FormClipEdge(new Vector4(1, 0, 0, 0).normalize());
    const right = new FormClipEdge(new Vector4(-1, 0, 0, 1).normalize());
    const top = new FormClipEdge(new Vector4(0, -1, 0, 1).normalize());
    const bottom = new FormClipEdge(new Vector4(0, 1, 0, 0).normalize());

    front.setNext(left);
    left.setNext(right);
    right.setNext(top);
    top.setNext(bottom);

    super(front);

    this.originVector = new Vector3(); // object used in buildTransform
  }

  setView(patch) {
    this.origin = patch.center;
    this.originVector.setTo(this.origin);
    this.n = patch.normal;
    this.randomizeUV();
  }

  // generate a random this.u and this.v pair for the given normal this.n
  randomizeUV() {
    // create a random U vector
    do {
      this.u = this.n.cross(Vector3.random());
    } while (this.u.length <= this.MIN_VALUE);

    this.u.normalize();
    this.v = this.u.cross(this.n);
  }

  buildTransform(u, v, n) {
    // Set view transformation matrix from world to view coordinates
    // transform so that u, v, n become the three axes

    /* eslint-disable no-multi-spaces, array-bracket-spacing */
    const m = [
      [ u.x, u.y, u.z, -this.originVector.dot(u) ],
      [ v.x, v.y, v.z, -this.originVector.dot(v) ],
      [ n.x, n.y, n.z, -this.originVector.dot(n) ],
      [ 0,   0,   0,   1                         ],
    ];
    /* eslint-enable */

    // the clip plane is at n-axis coordinate 1
    // translate so it's at origin
    m[2][3] -= 1;

    // multiply by perspective transformation matrix (eq. 5.36)
    m[3][0] += m[2][0];
    m[3][1] += m[2][1];
    m[3][2] += m[2][2];
    m[3][3] += m[2][3];

    // multiply by normalization matrix (eq. 5.37)
    m[0][0] = 0.5 * (m[0][0] + m[3][0]);
    m[0][1] = 0.5 * (m[0][1] + m[3][1]);
    m[0][2] = 0.5 * (m[0][2] + m[3][2]);
    m[0][3] = 0.5 * (m[0][3] + m[3][3]);

    m[1][0] = 0.5 * (m[1][0] + m[3][0]);
    m[1][1] = 0.5 * (m[1][1] + m[3][1]);
    m[1][2] = 0.5 * (m[1][2] + m[3][2]);
    m[1][3] = 0.5 * (m[1][3] + m[3][3]);

    m[2][0] = SN * m[2][0] + RN * m[3][0];
    m[2][1] = SN * m[2][1] + RN * m[3][1];
    m[2][2] = SN * m[2][2] + RN * m[3][2];
    m[2][3] = SN * m[2][3] + RN * m[3][3];

    this.transMatrix = m;
  }

  updateView(faceId) {
    let u, v, n;
    switch (faceId) {
      case TOP:
        u = this.u; v = this.v; n = this.n;
        break;
      case FRONT:
        u = this.u.negated(); v = this.n; n = this.v;
        break;
      case RIGHT:
        u = this.v; v = this.n; n = this.u;
        break;
      case BACK:
        u = this.u; v = this.n; n = this.v.negated();
        break;
      case LEFT:
        u = this.v.negated(); v = this.n; n = this.u.negated();
        break;
    }
    this.buildTransform(u, v, n);
  }
}
