class Vector3 {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  // object's functions
  magnitude() {
    return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
  }

  addVector3(v) {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
  }

  subVector3(v) {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
  }

  multScalar(s) {
    this.x *= s;
    this.y *= s;
    this.z *= s;
  }

  divScalar(s) {
    this.x /= s;
    this.y /= s;
    this.z /= s;
  }

  invert() {
    this.x *= -1;
    this.y *= -1;
    this.z *= -1;
  }

  // static functions
  static addVector3s(v1, v2) {
    return new Vector3(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
  }

  static subVector3s(v1, v2) {
    return new Vector3(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
  }

  static multVector3ByScalar(v, s) {
    return new Vector3(v.x * s, v.y * s, v.z * s);
  }

  static divVector3ByScalar(v, s) {
    return new Vector3(v.x / s, v.y / s, v.z / s);
  }

  static invertVector3(v) {
    return new Vector3(-v.x, -v.y, -v.z);
  }

  static dotProduct(v1, v2) {
    return (v1.x * v2.x + v1.y * v2.y + v1.z * v2.z);
  }

  static crossProduct(v1, v2) {
    return new Vector3(v1.y * v2.z - v1.z * v2.y, v1.z * v2.x - v1.x * v2.z, v1.x * v2.y - v1.y * v2.x);
  }
}

module.exports = Vector3;
