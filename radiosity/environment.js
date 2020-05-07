import Point3 from './point3.js';

export default class Environment {
  constructor(instances) {
    this.instances = instances;
    this.elementsNumbered = null;
  }

  get surfaceCount() {
    return sum(this.instances.map(i => i.surfaces.length));
  }

  get patchCount() {
    return sum(
      this.instances.flatMap(i =>
        i.surfaces.map(s => s.patches.length)));
  }

  get elementCount() {
    return sum(
      this.instances.flatMap(i =>
        i.surfaces.flatMap(s =>
          s.patches.map(p => p.elements.length))));
  }

  get vertexCount() {
    return sum(this.instances.map(i => i.vertices.length));
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

  numberElements() {
    if (this.elementsNumbered != null) return this.elementsNumbered;

    let elementNumber = 0;
    for (const i of this.instances) {
      for (const s of i.surfaces) {
        for (const p of s.patches) {
          for (const e of p.elements) {
            e.number = elementNumber;
            elementNumber += 1;
          }
        }
      }
    }

    this.elementsNumbered = elementNumber;
    return elementNumber;
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

  // interpolate vertex reflected exitances from their surrounding elements
  interpolateVertexExitances() {
    for (const instance of this.instances) {
      for (const vertex of instance.vertices) {
        vertex.exitance.reset();

        // average surrounding element exitances
        for (const element of vertex.elements) {
          vertex.exitance.add(element.exitance);
        }
        vertex.exitance.scale(1 / vertex.elements.length);
      }
    }
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
