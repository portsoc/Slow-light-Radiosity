import Point3 from './point3.js';

export const MAX_VERT = 10; // maximum vertices in a quad clipped by six planes

export default class FormPoly {
  constructor() {
    this.points = new Array(MAX_VERT); // Output vertex array
    this.numVert = 0;                  // current number of vertices

    for (let i = 0; i < MAX_VERT; i += 1) {
      this.points[i] = new Point3();
    }
  }

  reset() {
    this.numVert = 0;
    return this;
  }

  addVertex(v) {
    v.projectToPoint(this.points[this.numVert]);
    this.numVert += 1;
    return this;
  }

  getPoint(i) {
    return this.points[i];
  }
}
