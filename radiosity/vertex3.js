import Spectra from './spectra.js';
import Vector3 from './vector3.js';

export default class Vertex3 {
  constructor(coord) {
    this.posn = coord;               // Vexter co-ordinates
    this._normal = null;             // Vertex normal (Vector3)
    this.elemList = [];              // Element list head
    this.next = null;                // Next vertex
    this.exitance = new Spectra();   // Vertex exitance
  }

  get normal() {
    if (this._normal === null) {
      this._normal = new Vector3(0, 0, 0);
      for (const e of this.elemList) {
        this._normal.add(e.normal());
      }
    }
    return this._normal.norm();
  }
}
