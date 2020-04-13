export default class Instance {
  constructor(surfaces) {
    this.surfaces = surfaces;
  }

  get vertices() {
    const set = new Set();
    for (const s of this.surfaces) {
      for (const p of s.patches) {
        addToSet(p.vertices, set);
        for (const e of p.elements) {
          addToSet(e.vertices, set);
        }
      }
    }
    return Array.from(set);
  }
}

function addToSet(arr, set) {
  for (const x of arr) set.add(x);
}
