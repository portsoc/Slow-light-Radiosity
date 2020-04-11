import Point3 from './point3.js';

export default class Vector3 {
  constructor(x, y, z) {
    if (x instanceof Point3 && y === undefined) {
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

  normalize() {
    const len = this.length;
    if (len > 0) {
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
}
