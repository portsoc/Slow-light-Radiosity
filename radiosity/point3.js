import Vector3 from './vector3.js';

export default class Point3 {
  constructor(x, y, z) {
    if (x instanceof Point3 && y === undefined) {
      this.x = x.x;
      this.y = x.y;
      this.z = x.z;
    } else {
      this.x = x;
      this.y = y;
      this.z = z;
    }
  }

  equals(p) {
    return p && this.x === p.x && this.y === p.y && this.z === p.z;
  }

  setTo(p) {
    this.x = p.x;
    this.y = p.y;
    this.z = p.z;
    return this;
  }

  addVector(v) {
    if (!(v instanceof Vector3)) throw new TypeError('point can only add vectors');

    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    return this;
  }

  dist(p) {
    return Math.sqrt((p.x - this.x) ** 2 + (p.y - this.y) ** 2 + (p.z - this.z) ** 2);
  }
}
