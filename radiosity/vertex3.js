import Spectra from './spectra.js';
import Vector3 from './vector3.js';
import Point3 from './point3.js';

export default class Vertex3 {
  constructor(point) {
    if (!(point instanceof Point3)) throw TypeError('vertex position must be Point3');

    this.pos = new Point3(point);    // Vertex co-ordinates (Point3)
    this._normal = null;             // Vertex normal (Vector3) (computed once in getter)
    this.elements = [];              // Elements that use this vertex
    this._exitance = new Spectra();  // Vertex exitance
  }

  get normal() {
    if (this._normal == null) {
      this._normal = new Vector3(0, 0, 0);
      for (const e of this.elements) {
        this._normal.add(e.normal);
      }
      this._normal.normalize();
    }
    return this._normal;
  }

  _addElement(e) {
    if (!this.elements.includes(e)) this.elements.push(e);
  }

  // exitance should not be reassigned
  get exitance() {
    return this._exitance;
  }
}
