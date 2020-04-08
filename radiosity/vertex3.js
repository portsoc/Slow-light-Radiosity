export default class Vertex3 {
  constructor(coord) {
    this.posn = coord;
    this.normal = 0;
    this.elemList = null;
    this.next = null;
    this.exitance.reset();
  }

  get normal() {
    while (this.elemList != null) { // * null or undefined
      this.normal += this.elemList.elem.normal;
      this.elemList = this.elemList.next;
    }
    return this.normal.norm();
  }
}
