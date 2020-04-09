import Spectra from './spectra.js';

export default class Vertex3 {
  constructor(coord) {
    this.posn = coord;       // Vexter co-ordinates
    this.normal = 0;         // Vertex normal
    this.elemList = [];    // Element list head
    this.next = null;        // Next vertex
    this.exitance = new Spectra();   // Vertex exitance
  }

  get normal() {
    while (this.elemList === []) {
      this.normal += this.elemList.elem.normal;
      this.elemList = this.elemList.next;
    }
    return this.normal.norm();
  }
}
