export default class Point3 {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  addVector(v) {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    return this;
  }
}
