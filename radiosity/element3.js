import Vector3 from './vector3.js';
import Spectra from './spectra.js';
import Point3 from './point3.js';

export default class Element3 {
  constructor(vertices) {
    this.parentPatch = null;          // Parent patch
    this._area = null;                // Element area (computed once in getter)
    this._normal = null;              // Normal vector (computed once in getter)
    this._exitance = new Spectra();   // Spectral exitance
    this._center = null;              // Vertex centroid (Point3, computed once in getter)

    if (!Array.isArray(vertices) || ![3, 4].includes(vertices.length)) {
      throw new TypeError('Element must have 3 or 4 vertices');
    }
    this.vertices = vertices;      // Vertices of this element
    this.isQuad = this.vertices.length === 4;

    // if we're an Element3 but not a subclass,
    // add ourself to each vertex's list of elements that use it
    if (Object.getPrototypeOf(this) === Element3.prototype) {
      for (const vertex of vertices) {
        vertex._addElement(this);
      }
    }
  }

  get area() {
    if (this._area == null) {
      const va = new Vector3(this.vertices[0].pos, this.vertices[1].pos);
      const vb = new Vector3(this.vertices[0].pos, this.vertices[2].pos);
      this._area = va.cross(vb).length / 2;
      if (this.isQuad) {
        const vc = new Vector3(this.vertices[0].pos, this.vertices[3].pos);
        this._area += vb.cross(vc).length / 2;
      }
    }
    return this._area;
  }

  get normal() {
    if (this._normal == null) {
      const va = new Vector3(this.vertices[0].pos, this.vertices[1].pos);
      const vb = new Vector3(this.vertices[0].pos, this.vertices[2].pos);
      this._normal = va.cross(vb).normalize();
    }
    return this._normal;
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

  // exitance should not be reassigned
  get exitance() {
    return this._exitance;
  }
}
