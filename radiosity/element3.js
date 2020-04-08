import Vector3 from './vector3.js';

export default class Element3 {
  constructor(vertexArray, patch) {
    this.patch = patch;
    this.area = 0;
    this.flags = 0;
    this.next = null;
    this.exitance.reset();
    this.vertexArray = vertexArray;
  }

  isQuad() {
    return this.flags & 0x01;
  }

  get numVert() {
    return (this.flags & 0x01) ? 4 : 3;
  }

  setQuad() {
    this.flag |= 0x01;
  }

  get area() {
    const va = new Vector3(this.vertexArray[0].posn, this.vertexArray[1].posn);
    const vb = new Vector3(this.vertexArray[0].posn, this.vertexArray[2].posn);
    let temp = va.cross(vb);
    this.area = temp.length / 2.0;
    if (this.isQuad()) {
      const vc = new Vector3(this.vertexArray[3].posn, this.vertexArray[0].posn);
      temp = vb.cross(vc);
      this.area += temp.length / 2.0;
    }
    return this.area;
  }

  get normal() {
    const va = new Vector3(this.vertexArray[0].posn, this.vertexArray[1].posn);
    const vb = new Vector3(this.vertexArray[0].posn, this.vertexArray[2].posn);
    this.normal = va.cross(vb);
    return this.normal.norm();
  }
}
