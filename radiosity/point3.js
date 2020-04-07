export default class Point3 {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  // object's functions
  addVector3(v) {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
  }

  // static function
  static addVector3ToPoint3(p, v) {
    return new Point3(v.x + p.x, v.y + p.y, v.z + p.z);
  }
}
