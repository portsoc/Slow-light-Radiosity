import Point3 from './point3.js';

const MAX_VERT = 10; // maximum vertices in a quad clipped by six planes

export default class FormPoly {
  constructor() {
    this.points = new Array(MAX_VERT); // Output vertex array
    this.numPoints = 0;                // current number of points
    this.id = -1;                      // Polygon identifier

    for (let i = 0; i < MAX_VERT; i += 1) {
      this.points[i] = new Point3();
    }
  }

  reset(polyId) {
    this.numPoints = 0;
    this.id = polyId;
    return this;
  }

  addVertex(v) {
    v.projectToPoint(this.pos[this.numPoints]);
    this.numPoints += 1;
    return this;
  }

  getPoint(i) {
    return this.points[i];
  }
}
