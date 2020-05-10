import Spectra from './spectra.js';

const MIN_VALUE = 1e-10;

export default class RadEqnSolve {
  constructor() {
    this.totalFlux = 0;              // Total environment flux
    this.totalUnsent = 0;            // Total unsent exitence
    this.stepCount = 0;              // Step count
    this.maxStep = 10000;              // Maximum number of steps
    this.stopCriterion = 0.00001;      // Stopping criterion
    this.convergence = null;         // Convergence
    this.max = null;                 // Maximum unsent flux patch
    this.env = null;                 // Environment
  }

  open() {
    throw new TypeError('RadEqnSolve is an abstract class');
  }

  initExitance() {
    for (const instance of this.env.instances) {
      for (const surface of instance.surfaces) {
        // Get surface emittance
        const emit = surface.emittance;

        for (const patch of surface.patches) {
          // Set patch unsent exitance
          patch.exitance.setTo(emit);

          // Update total envnironment flux
          this.totalFlux += patch.unsentFlux;

          // Initialize element and vertex exitance
          for (const element of patch.elements) {
            element.exitance.reset();
            for (const vertex of patch.vertices) {
              vertex.exitance.reset();
            }
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

    for (const instance of this.env.instances) {
      for (const surface of instance.surfaces) {
        for (const patch of surface.patches) {
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
}
