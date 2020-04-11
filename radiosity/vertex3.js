import Spectra from './spectra.js';
import Vector3 from './vector3.js';

export default class Vertex3 {
  constructor(coord) {
    this.pos = coord;                // Vertex co-ordinates (Point3)
    this._normal = null;             // Vertex normal (Vector3) (computed once in getter)
    this.elements = [];              // Elements that use this vertex
    this.exitance = new Spectra();   // Vertex exitance
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

  addElement(e) {
    if (!this.elements.includes(e)) this.elements.push(e);
  }
}
