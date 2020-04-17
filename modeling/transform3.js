import Point3 from '../radiosity/point3.js';
import Instance from '../radiosity/instance.js';

const sin = Math.sin;
const cos = Math.cos;

export default class Transform3 {
  constructor(m) {
    this.matrix = m || identity();
  }

  rotateX(deg) {   // Rotate counterclockwise
    this.matrix = mmult(rotationX(deg), this.matrix);
    return this;
  }

  rotateY(deg) {   // Rotate counterclockwise
    this.matrix = mmult(rotationY(deg), this.matrix);
    return this;
  }

  rotateZ(deg) {   // Rotate counterclockwise
    this.matrix = mmult(rotationZ(deg), this.matrix);
    return this;
  }

  rotate(x, y, z) {
    this.matrix = mmult(rotationZ(z), rotationY(y), rotationX(x), this.matrix);
    return this;
  }

  scale(x, y, z) {
    this.matrix = mmult(scaling(x, y, z), this.matrix);
    return this;
  }

  translate(x, y, z) {
    this.matrix = mmult(translation(x, y, z), this.matrix);
    return this;
  }

  transform(obj) {
    if (obj instanceof Point3) return this.transformPoint(obj);
    if (obj instanceof Instance) return this.transformInstance(obj);

    throw new TypeError('unknown object to transform');
  }

  transformPoint(p) {   // transform one point by 3D transformation matrix
    const x = this.matrix[0][0] * p.x + this.matrix[0][1] * p.y + this.matrix[0][2] * p.z + this.matrix[0][3];
    const y = this.matrix[1][0] * p.x + this.matrix[1][1] * p.y + this.matrix[1][2] * p.z + this.matrix[1][3];
    const z = this.matrix[2][0] * p.x + this.matrix[2][1] * p.y + this.matrix[2][2] * p.z + this.matrix[2][3];
    p.x = x;
    p.y = y;
    p.z = z;
    return p;
  }

  transformInstance(i) {
    // transform each vertex
    for (const v of i.vertices) {
      this.transformPoint(v.pos);
    }
    return i;
  }
}

function identity() {
  return [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ];
}

function translation(x, y, z) {
  return [
    [1, 0, 0, x],
    [0, 1, 0, y],
    [0, 0, 1, z],
    [0, 0, 0, 1],
  ];
}

// if called with a single number, it applies to all axes
function scaling(x, y = x, z = x) {
  return [
    [x, 0, 0, 0],
    [0, y, 0, 0],
    [0, 0, z, 0],
    [0, 0, 0, 1],
  ];
}

function rotationX(deg) {
  const rad = toRad(deg);
  return [
    [1, 0, 0, 0],
    [0, cos(rad), -sin(rad), 0],
    [0, sin(rad), cos(rad), 0],
    [0, 0, 0, 1],
  ];
}

function rotationY(deg) {
  const rad = toRad(deg);
  return [
    [cos(rad), 0, sin(rad), 0],
    [0, 1, 0, 0],
    [-sin(rad), 0, cos(rad), 0],
    [0, 0, 0, 1],
  ];
}

function rotationZ(deg) {
  const rad = toRad(deg);
  return [
    [cos(rad), -sin(rad), 0, 0],
    [sin(rad), cos(rad), 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ];
}

// matrix multiplication, assuming 4x4 matrices
export function mmult(a, b, ...more) {
  const retval = [[], [], [], []];
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      retval[row][col] = 0;
      for (let i = 0; i < 4; i += 1) {
        retval[row][col] += a[row][i] * b[i][col];
      }
    }
  }
  return more.length === 0 ? retval : mmult(retval, ...more);
}

function toRad(deg) {
  return deg / 180 * Math.PI;
}
