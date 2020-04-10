export default class Surface3 {
  constructor(reflectance, emittance) {
    this.reflectance = reflectance;   // Spectral reflectance
    this.emittance = emittance;       // Initial radiant exitance
    this.patchList = [];              // Patch list
    this.next = null;                 // Next surface
  }
}
