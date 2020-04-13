import Spectra from './spectra.js';

export default class Surface3 {
  constructor(reflectance, emittance, patches) {
    this._reflectance = new Spectra(reflectance);   // Spectral reflectance
    this._emittance = new Spectra(emittance);       // Initial radiant exitance
    this.patches = patches;           // Patches that make up the surface

    // set parent surface of the given patches
    for (const patch of patches) {
      patch.parentSurface = this;
    }
  }

  // reflectance and emittance should not be reassigned
  get reflectance() {
    return this._reflectance;
  }

  get emittance() {
    return this._emittance;
  }
}
