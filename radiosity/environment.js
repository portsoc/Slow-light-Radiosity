import Point3 from './point3.js';
import Spectra from './spectra.js';

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
    for (const e of this.elements) {
      e.number = elementNumber;
      elementNumber += 1;
    }

    this.elementsNumbered = elementNumber;
    return elementNumber;
  }

  * _vertexIterator() {
    for (const i of this.instances) {
      for (const v of i.vertices) {
        yield v;
      }
    }
  }

  get vertices() {
    return this._vertexIterator();
  }

  * _elementsIterator() {
    for (const i of this.instances) {
      for (const s of i.surfaces) {
        for (const p of s.patches) {
          for (const e of p.elements) {
            yield e;
          }
        }
      }
    }
  }

  get elements() {
    return this._elementsIterator();
  }

  * _patchesIterator() {
    for (const i of this.instances) {
      for (const s of i.surfaces) {
        for (const p of s.patches) {
          yield p;
        }
      }
    }
  }

  get patches() {
    return this._patchesIterator();
  }

  * _surfacesIterator() {
    for (const i of this.instances) {
      for (const s of i.surfaces) {
        yield s;
      }
    }
  }

  get surfaces() {
    return this._surfacesIterator();
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
  interpolateVertexExitances(now) {
    if (now === undefined) {
      // everything has one .exitance
      for (const vertex of this.vertices) {
        vertex.exitance.reset();

        for (const element of vertex.elements) {
          vertex.exitance.add(element.exitance);
        }
        vertex.exitance.scale(1 / vertex.elements.length);
      }
    } else {
      // we deal with .futureExitances
      for (const vertex of this.vertices) {
        // don't interpolate past the size of futureExitances
        if (now >= vertex.futureExitances.length) return;

        vertex.futureExitances[now].reset();

        for (const element of vertex.elements) {
          vertex.futureExitances[now].add(element.futureExitances[now]);
        }
        vertex.futureExitances[now].scale(1 / vertex.elements.length);
      }
    }
  }

  initializeFutureExitances(length) {
    for (const patch of this.patches) {
      initializeObjectFutureExitances(patch, length);
    }
    for (const element of this.elements) {
      initializeObjectFutureExitances(element, length);
    }
    for (const vertex of this.vertices) {
      initializeObjectFutureExitances(vertex, length);
    }
  }
}

function initializeObjectFutureExitances(obj, length) {
  obj.futureExitances = new Array(length);
  for (let i = 0; i < length; i += 1) {
    obj.futureExitances[i] = new Spectra();
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
