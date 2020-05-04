import Point3 from './point3.js';

const MIN_VALUE = 1e-10;

export default class Vector3 {
  constructor(x, y, z) {
    if ((x instanceof Point3 || x instanceof Vector3) && y === undefined) {
      this.x = x.x;
      this.y = x.y;
      this.z = x.z;
    } else if (x instanceof Point3 && y instanceof Point3 && z === undefined) {
      this.x = y.x - x.x;
      this.y = y.y - x.y;
      this.z = y.z - x.z;
    } else {
      this.x = x;
      this.y = y;
      this.z = z;
    }
  }

  get length() {
    return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
  }

  setTo(v) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
  }

  add(v) {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    return this;
  }

  sub(v) {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
    return this;
  }

  scale(s) {
    this.x *= s;
    this.y *= s;
    this.z *= s;
    return this;
  }

  // allows precise integer division, useful for testing
  div(s) {
    this.x /= s;
    this.y /= s;
    this.z /= s;
    return this;
  }

  normalize() {
    const len = this.length;
    if (len > MIN_VALUE) {
      this.x /= len;
      this.y /= len;
      this.z /= len;
    }
    return this;
  }

  dot(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  cross(v) {
    return new Vector3(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x,
    );
  }

  negated() {
    return new Vector3(
      -this.x,
      -this.y,
      -this.z,
    );
  }

  static random() {
    return new Vector3(
      Math.random() * 2 - 1,
      Math.random() * 2 - 1,
      Math.random() * 2 - 1,
    );
  }
}
