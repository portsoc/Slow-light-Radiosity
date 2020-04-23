export default class FormPoly {
  constructor() {
    this.pos = [];      // Output vertex array
    this.numVert = 0;   // Number of vetices
    this.polyId = 0;    // Polygon identifier
  }

  reset(polyId) {
    this.numVert = 0;
    this.polyId = polyId;
    return this;
  }

  addVertex(v) {
    v.perspective(this.pos[this.numVert++]);
    return this;
  }

  getVertex(i) {
    return this.pos[i];
  }
}
