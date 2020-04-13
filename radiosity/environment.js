export default class Environment {
  constructor(instances) {
    this.instances = instances;
  }

  get numInst() {
    return this.instances.length;
  }

  get numSurf() {
    return sum(this.instances.map(i => i.surfaces.length));
  }

  get numPatch() {
    return sum(
      this.instances.flatMap(i =>
        i.surfaces.map(s => s.patches.length)));
  }

  get numElem() {
    return sum(
      this.instances.flatMap(i =>
        i.surfaces.flatMap(s =>
          s.patches.map(p => p.elements.length))));
  }

  get numVert() {
    return sum(this.instances.map(i => i.vertices.length));
  }

  checkNoVerticesAreShared() {
    for (const i of this.instances) {
      for (const s of i.surfaces) {
        for (const p of s.patches) {
          if (!allVerticesBelongToSurface(p.vertices, s)) return false;
          for (const e of p.elements) {
            if (!allVerticesBelongToSurface(e.vertices, s)) return false;
          }
        }
      }
    }
    return true;
  }
}

function sum(array) {
  return array.reduce((a, b) => a + b, 0);
}

function allVerticesBelongToSurface(vertices, surface) {
  for (const v of vertices) {
    for (const el of v.elements) {
      if (el.parentPatch.parentSurface !== surface) return false;
    }
  }
  return true;
}
