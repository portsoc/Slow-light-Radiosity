import Point3 from '../radiosity/point3.js';

export default class Transform3 {
  constructor() {
    this.scales = [1, 1, 1];         // Scaling factors
    this.translations = [0, 0, 0];   // Translation distances
    this.rotations = [0, 0, 0];      // Rotations (in radians)
    this.matrix = [[], [], []];      // Transformation matrix
    this.identity();
  }

  identity() {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 4; j++) {
        this.matrix[i][j] = (i === j) ? 1 : 0;
      }
    }
    return this.matrix;
  }

  rotateX(rad) {   // Rotate counterclockwise
    let tmp;
    for (let i = 0; i < 4; i++) {
      tmp = this.matrix[1][i] * Math.cos(rad) - this.matrix[2][i] * Math.sin(rad);
      this.matrix[2][i] = this.matrix[1][i] * Math.sin(rad) + this.matrix[2][i] * Math.cos(rad);
      this.matrix[1][i] = tmp;
    }
    return this.matrix;
  }

  rotateY(rad) {   // Rotate counterclockwise
    let tmp;
    for (let i = 0; i < 4; i++) {
      tmp = this.matrix[0][i] * Math.cos(rad) + this.matrix[2][i] * Math.sin(rad);
      this.matrix[2][i] = -this.matrix[0][i] * Math.sin(rad) + this.matrix[2][i] * Math.cos(rad);
      this.matrix[0][i] = tmp;
    }
    return this.matrix;
  }

  rotateZ(rad) {   // Rotate counterclockwise
    let tmp;
    for (let i = 0; i < 4; i++) {
      tmp = this.matrix[0][i] * Math.cos(rad) - this.matrix[1][i] * Math.sin(rad);
      this.matrix[1][i] = this.matrix[0][i] * Math.sin(rad) + this.matrix[1][i] * Math.cos(rad);
      this.matrix[0][i] = tmp;
    }
    return this.matrix;
  }

  scale() {
    this.matrix[0][0] *= this.scales[0];
    this.matrix[1][1] *= this.scales[1];
    this.matrix[2][2] *= this.scales[2];
    return this.matrix;
  }

  translate() {
    this.matrix[0][3] += this.translations[0];
    this.matrix[1][3] += this.translations[1];
    this.matrix[2][3] += this.translations[2];
    return this.matrix;
  }

  buildTransform() {
    this.identity();                   // Initialize identity matrix
    this.scale();                      // Concatenate scales matrix
    this.rotateX(this.rotations[0]);   // Concatenate rotation matrix
    this.rotateY(this.rotations[1]);
    this.rotateZ(this.rotations[2]);
    this.translate();                  // Concatenate translation matrix
    return this.matrix;
  }

  transform(p) {   // Premultiply point by 3D transformation matrix
    const tmp = new Point3(
      this.matrix[0][0] * p.x + this.matrix[0][1] * p.y + this.matrix[0][2] * p.z + this.matrix[0][3],
      this.matrix[1][0] * p.x + this.matrix[1][1] * p.y + this.matrix[1][2] * p.z + this.matrix[1][3],
      this.matrix[2][0] * p.x + this.matrix[2][1] * p.y + this.matrix[2][2] * p.z + this.matrix[2][3],
    );
    p.x = tmp.x;
    p.y = tmp.y;
    p.z = tmp.z;
    return p;
  }
}
