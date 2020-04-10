import Element3 from './element3.js';
import Point3 from './point3.js';
import Vector3 from './vector3.js';

export default class Patch3 extends Element3 {
  constructor(vertexArray, parentSurface) {
    super(vertexArray, null);
    this.elem = [];           // Element list
    this.parentSurface = parentSurface;   // Parent surface
  }

  get unsentFlux() {
    return (this.exitance.GetRedBand() + this.exitance.GetGreenBand() + this.exitance.GetBlueBand()) * this.area;
  }

  get center() {
    const cv = new Vector3(0, 0, 0);
    for (let i = 0; i < this.numVert; i++) {
      cv.add(new Vector3(this.vertexArray[i].posn));
    }
    cv.scale(1 / this.numVert);
    this.center = new Point3(cv.x, cv.y, cv.z);
    return this.center;
  }
}
