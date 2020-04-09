export default class Vertex3 {
  constructor(coord) {
    this.posn = coord;       // Vexter co-ordinates
    this.normal = 0;         // Vertex normal
    this.elemList = null;    // Element list head
    this.next = null;        // Next vertex
    this.exitance.reset();   // Vertex exitance
  }

  get normal() {
    while (this.elemList != null) { // * null or undefined
      this.normal += this.elemList.elem.normal;
      this.elemList = this.elemList.next;
    }
    return this.normal.norm();
  }
}
