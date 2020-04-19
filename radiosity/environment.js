import Point3 from '../radiosity/point3.js';

export default class Environment {
  constructor(instances) {
    this.instances = instances;
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

  get boundingBox() {
    let minX, minY, minZ;
    minX = minY = minZ = Infinity;
    let maxX, maxY, maxZ;
    maxX = maxY = maxZ = -Infinity;
    for (const instance of this.instances) {
      for (const vertex of instance.vertices) {
        minX = Math.min(minX, vertex.pos.x);
        minY = Math.min(minY, vertex.pos.y);
        minZ = Math.min(minZ, vertex.pos.z);
        maxX = Math.max(maxX, vertex.pos.x);
        maxY = Math.max(maxY, vertex.pos.y);
        maxZ = Math.max(maxZ, vertex.pos.z);
      }
    }
    return [new Point3(minX, minY, minZ), new Point3(maxX, maxY, maxZ)];
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
