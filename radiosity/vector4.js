import Point3 from './point3.js';

const MIN_VALUE = 1e-10;

export default class Vector4 {
  constructor(x, y, z, w) {
    if (x instanceof Vector4 && y === undefined) {
      this.x = x.x;
      this.y = x.y;
      this.z = x.z;
      this.w = x.w;
    } else {
      this.x = x;
      this.y = y;
      this.z = z;
      this.w = w;
    }
  }

  add(v) {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    this.w += v.w;
    return this;
  }

  sub(v) {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
    this.w -= v.w;
    return this;
  }

  scale(s) {
    this.x *= s;
    this.y *= s;
    this.z *= s;
    this.w *= s;
    return this;
  }

  // allows precise integer division, useful for testing
  div(s) {
    this.x /= s;
    this.y /= s;
    this.z /= s;
    this.w /= s;
    return this;
  }

  get length() {
    return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2 + this.w ** 2);
  }

  normalize() {
    const len = this.length;
    if (len > MIN_VALUE) {
      this.x /= len;
      this.y /= len;
      this.z /= len;
      this.w /= len;
    }
    return this;
  }

  dot(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;
  }

  // Premultiply point/vector by projective matrix
  projTransform(pv, m) {
    this.x = (m[0][0] * pv.x + m[0][1] * pv.y + m[0][2] * pv.z + m[0][3]);
    this.y = (m[1][0] * pv.x + m[1][1] * pv.y + m[1][2] * pv.z + m[1][3]);
    this.z = (m[2][0] * pv.x + m[2][1] * pv.y + m[2][2] * pv.z + m[2][3]);
    this.w = (m[3][0] * pv.x + m[3][1] * pv.y + m[3][2] * pv.z + m[3][3]);
    return this;
  }

  // Perform perspective division into a Point3
  projectToPoint(p) {
    p.x = this.x / this.w;
    p.y = this.y / this.w;
    p.z = this.z / this.w;
  }
}
