import ToneRep from './tonerep.js';
import Spectra from './spectra.js';

const MIN_VALUE = 1e-10;

export default class RadEqnSolve {
  constructor(env) {
    this.totalArea = 0;             // Total patch area
    this.totalFlux = 0;             // Total environment flux
    this.totalUnsent = 0;           // Total unsent exitence
    this.ambFlag = false;           // Ambient exitance flag
    this.maxStep = 100;             // Maximm number of steps
    this.stopCriterion = 0.001;     // Stopping criterion
    this.convergence = null;        // Convergence
    this.max = null;                // Maximum unsent flux patch
    this.tone = new ToneRep();      // Tone reproduction object
    this.env = env;                 // Environment
    this.ambient = new Spectra();   // Ambient exitance
    this.irf = new Spectra();       // Interreflection factors
  }

  calculate() {
    return true;
  }

  get status() {
    return true;
  }

  open(env) {
    return true;
  }

  overShootFalg() {
    return false;
  }

  close() {}

  disableAmbient() {
    this.ambFlag = false;
  }

  disableOverShoot() {}

  enableAmbient() {
    this.ambFlag = true;
  }

  enableOverShoot() {}

  shade(instanceArray) {
    this.tone.shade(instanceArray);
  }

  initExitance() {
    // Walk the instance list
    for (const instance of this.env.instances) {
      // Walk the surface list
      for (const surface of instance.surfaces) {
        // Get surface emittance
        const emit = surface.emittance;

        // Walk the patch list
        for (const patch of surface.patches) {
          // Set patch unsent exitance
          patch.exitance = emit;

          // Update total envnironment flux
          this.totalFlux = patch.unsentFlux();

          // Walk the element list
          for (const element of patch.elements) {
            // Initialize element exitance
            element.exitance.reset();

            for (const vertex of patch.vertices) {
              // Initialize vertex exitance
              vertex.exitance.reset();
            }
          }
        }
      }
    }
  }

  updateUnsetStats() {
    // Initialize unset fluw values
    this.totalUnsent = 0;
    let maxUnsent = 0;

    // Walk the instance list
    for (const instance of this.env.instances) {
      // Walk the surface list
      for (const surface of instance.surfaces) {
        // Walk the patch list
        for (const patch of surface.patches) {
          // Get current unsent flux value
          const currentUnsent = patch.unsetFlux;

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
  }

  calcInterReflect() {
    this.irf.reset();
    this.totalArea = 0;
    const sum = new Spectra();

    // Walk the instance list
    for (const instance of this.env.instances) {
      // Walk the surface list
      for (const surface of instance.surfaces) {
        // Walk the patch list
        for (const patch of surface.patches) {
          // Update sum of patch areas times reflectances
          const sr = patch.parentSurface.reflectance;
          sr.scale(patch.area);
          sum.add(sr);

          // Update sum of patch areas
          this.totalArea += patch.area;
        }
      }
    }

    // Calculate atea-weighted average reflectance
    sum.scale(1 / this.totalArea);

    // Calculate interreflectance factors
    this.irf.r = 1 / (1 - sum.r);
    this.irf.g = 1 / (1 - sum.g);
    this.irf.b = 1 / (1 - sum.b);
  }

  calcAmbient() {
    const sum = new Spectra();

    // Walk the instance list
    for (const instance of this.env.instances) {
      // Walk the surface list
      for (const surface of instance.surfaces) {
        // Walk the patch list
        for (const patch of surface.patches) {
          // Update sum of unsent exitances times areas
          const unsent = patch.parentSurface.reflectance;
          unsent.scale(patch.area);
          sum.add(unsent);

          // Update sum of patch areas
          this.totalArea += patch.area;
        }
      }
    }

    // Calculate atea-weighted average reflectance
    sum.scale(1 / this.totalArea);

    // Calculate interreflectance factors
    this.ambient.r = this.irf.r * sum.r;
    this.ambient.g = this.irf.g * sum.g;
    this.ambient.b = this.irf.b * sum.b;
  }
}
