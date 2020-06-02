import Spectra from './spectra.js';

const MIN_VALUE = 1e-10;

export default class RadEqnSolve {
  constructor() {
    this.totalFlux = 0;              // Total environment flux
    this.totalUnsent = 0;            // Total unsent exitence
    this.stepCount = 0;              // Step count
    this.maxStep = 10000;            // Maximum number of steps
    this.maxTime = this.maxStep;     // maximum for animation purposes
    this.stopCriterion = 0.001;      // Stopping criterion
    this.convergence = null;         // Convergence
    this.max = null;                 // Maximum unsent flux patch
    this.env = null;                 // Environment

    this.ambient = new Spectra();    // Ambient exitance
    this.irf = new Spectra();        // Interreflection factors
    this.totalArea = 0;              // Total patch area
  }

  open() {
    throw new TypeError('RadEqnSolve is an abstract class');
  }

  initExitance() {
    this.totalFlux = 0;
    for (const surface of this.env.surfaces) {
      // Get surface emittance
      const emit = surface.emittance;

      for (const patch of surface.patches) {
        // Set patch unsent exitance
        patch.exitance.setTo(emit);

        // Update total envnironment flux
        this.totalFlux += patch.unsentFlux;

        // Initialize element and vertex exitance
        for (const element of patch.elements) {
          element.exitance.setTo(emit);
          for (const vertex of patch.vertices) {
            vertex.exitance.reset();
          }
        }
      }
    }

    return this;
  }

  updateUnsentStats() {
    // Initialize unsent flux values
    this.totalUnsent = 0;
    let maxUnsent = 0;

    for (const patch of this.env.patches) {
      // Get current unsent flux value
      const currentUnsent = patch.unsentFlux;

      // Update total unsent flux
      this.totalUnsent += currentUnsent;

      // Update maximum unsent flux and patch pointer
      if (currentUnsent > maxUnsent) {
        maxUnsent = currentUnsent;
        this.max = patch;
      }
    }

    // Update convergence value
    if (this.totalFlux > MIN_VALUE) {
      this.convergence = Math.abs(this.totalUnsent / this.totalFlux);
    } else {
      this.convergence = 0;
    }

    return this;
  }

  calcInterReflect() {
    this.irf.reset();
    this.totalArea = 0;
    const sum = new Spectra();
    const tmp = new Spectra();

    for (const patch of this.env.patches) {
      // Update sum of patch areas times reflectances
      tmp.setTo(patch.parentSurface.reflectance);
      tmp.scale(patch.area);
      sum.add(tmp);

      // Update sum of patch areas
      this.totalArea += patch.area;
    }

    // Calculate atea-weighted average reflectance
    sum.scale(1 / this.totalArea);

    // Calculate interreflectance factors
    this.irf.r = 1 / (1 - sum.r);
    this.irf.g = 1 / (1 - sum.g);
    this.irf.b = 1 / (1 - sum.b);

    return this;
  }

  calcAmbient() {
    const sum = new Spectra();
    const tmp = new Spectra();

    for (const patch of this.env.patches) {
      // Update sum of unsent exitances times areas
      tmp.setTo(patch.exitance);
      tmp.scale(patch.area);
      sum.add(tmp);
    }

    // Calculate area-weighted average reflectance
    sum.scale(1 / this.totalArea);

    // Calculate interreflectance factors
    this.ambient.r = this.irf.r * sum.r;
    this.ambient.g = this.irf.g * sum.g;
    this.ambient.b = this.irf.b * sum.b;

    return this;
  }
}
