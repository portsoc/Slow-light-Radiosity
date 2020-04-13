import Vector3 from './vector3.js';
import Spectra from './spectra.js';

export default class Element3 {
  constructor(vertices) {
    this.parentPatch = null;          // Parent patch
    this._area = null;                // Element area (computed once in getter)
    this._normal = null;              // Normal vector (computed once in getter)
    this.exitance = new Spectra();    // Spectral exitance

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
      let temp = va.cross(vb);
      this._area = temp.length / 2.0;
      if (this.isQuad) {
        const vc = new Vector3(this.vertices[3].pos, this.vertices[0].pos);
        temp = vb.cross(vc);
        this._area += temp.length / 2.0;
      }
    }
    return this._area;
  }

  get normal() {
    if (this._normal == null) {
      const va = new Vector3(this.vertices[0].pos, this.vertices[1].pos);
      const vb = new Vector3(this.vertices[0].pos, this.vertices[2].pos);
      this._normal = va.cross(vb);
      this._normal.normalize();
    }
    return this._normal;
  }
}
