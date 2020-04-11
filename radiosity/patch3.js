import Element3 from './element3';
import Point3 from './point3';
import Vector3 from './vector3';

export default class Patch3 extends Element3 {
  constructor(vertices, parentSurface) {
    super(vertices, null);
    this.elements = [];                   // Elements that make up this patch
    this.parentSurface = parentSurface;   // Parent surface
    this._center = null;                  // Vertex centroid (computed once in getter)
  }

  get unsentFlux() {
    return (this.exitance.r + this.exitance.g + this.exitance.b) * this.area;
  }

  get center() {
    if (this._center == null) {
      const cv = new Vector3(0, 0, 0);
      for (const vert of this.vertices) {
        cv.add(new Vector3(vert.pos));
      }
      cv.scale(1 / this.vertices.length);
      this._center = new Point3(cv.x, cv.y, cv.z);
    }
    return this._center;
  }
}
