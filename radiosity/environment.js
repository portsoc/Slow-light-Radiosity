export default class Environment {
  constructor() {
    this.instances = [];
  }

  get numInst() {
    return this.instances.length;
  }

  get numSurf() {
    return sum(this.instances.map(i => i.surfaces.length));
  }

  get numPatch() {
    // todo
  }

  get numElem() {
    // todo
  }

  get numVert() {
    // todo
  }
}

function sum(array) {
  return array.reduce((a, b) => a + b, 0);
}
