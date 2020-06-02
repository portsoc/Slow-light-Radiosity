export default class Instance {
  constructor(surfaces) {
    this.surfaces = surfaces;
    this._vertices = null;       // Instance vertices (computed once in getter)
  }

  get vertices() {
    if (this._vertices == null) {
      const set = new Set();
      for (const s of this.surfaces) {
        for (const p of s.patches) {
          addToSet(p.vertices, set);
          for (const e of p.elements) {
            addToSet(e.vertices, set);
          }
        }
      }
      this._vertices = Array.from(set);
    }

    return this._vertices;
  }
}

function addToSet(arr, set) {
  for (const x of arr) set.add(x);
}
