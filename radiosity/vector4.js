export default class Vector4 {
  constructor(x, y, z, w) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
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
    this.w *= s.w;
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
    if (len > 0) {
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

  // Perform perspective division on point/vector
  perspective(pv) {
    pv.x = this.x / this.w;
    pv.y = this.y / this.w;
    pv.z = this.z / this.w;
  }
}
