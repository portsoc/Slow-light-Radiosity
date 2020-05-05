import Element3 from './element3.js';
import Point3 from './point3.js';
import Vector3 from './vector3.js';

export default class Patch3 extends Element3 {
  // if no element is provided, we create one that coincides with this patch
  constructor(vertices, elements) {
    super(vertices);

    if (elements == null) {
      // create one element that coincides with this patch
      elements = [new Element3(vertices)];
    }

    this.elements = elements;   // Elements that make up this patch
    this.parentSurface = null;  // Parent surface
    this._center = null;        // Vertex centroid (Point3, computed once in getter)

    // set parent patch of elements
    for (const el of elements) {
      el.parentPatch = this;
    }
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
