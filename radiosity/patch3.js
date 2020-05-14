import Element3 from './element3.js';

export default class Patch3 extends Element3 {
  // if no element is provided, we create one that coincides with this patch
  constructor(vertices, elements) {
    super(vertices);

    if (elements == null) {
      // create one element that coincides with this patch
      elements = [new Element3(vertices)];
    }

    this.elements = elements;   // Elements that make up this patch
    this.parentSurface = null;  // Parent surface

    // set parent patch of elements
    for (const el of elements) {
      el.parentPatch = this;
    }
  }

  get unsentFlux() {
    return (this.exitance.r + this.exitance.g + this.exitance.b) * this.area;
  }
}
