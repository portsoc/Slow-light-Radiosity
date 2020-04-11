import Vector3 from './vector3.js';

export default class Point3 {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  addVector(v) {
    if (!(v instanceof Vector3)) throw new TypeError('point can only add vectors');

    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    return this;
  }
}
