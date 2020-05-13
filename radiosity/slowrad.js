import RadEqnSolve from './radeqnsolve.js';
import HemiCube from './hemicube.js';
import Spectra from './spectra.js';

export default class SlowRad extends RadEqnSolve {
  constructor() {
    super();

    this.ffd = new HemiCube();        // Form factor determination
  }

  open(env) {
    this.env = env;
    this.stepCount = 0;
    this.convergence = 1;
    this.initExitance();

    this.calcInterReflect();

    return true;
  }

  close() {
    this.prepareForDisplay();
  }

  prepareForDisplay() {
    if (this.needsDisplayUpdate) {
      this.calcAmbient();
      this.env.ambient = this.ambient;
      this.env.interpolateVertexExitances();
      this.needsDisplayUpdate = false;
    }
  }

  calculate() {
    // Check for maximum number of steps
    if (this.stepCount >= this.maxStep) {
      return true;
    }

    this.needsDisplayUpdate = true;

    // Update unsent flux statistics
    this.updateUnsentStats();

    // Check for convergence
    if (this.convergence < this.stopCriterion) {
      return true;
    }

    const shoot = new Spectra();

    for (const currentPatch of this.env.patches) {
      if (!currentPatch.ffArray) {
        console.log({currentPatch});
        currentPatch.ffArray = new Array(this.env.numberElements());
        this.ffd.calculateFormFactors(currentPatch, this.env, currentPatch.ffArray);
      }
      const ffArray = currentPatch.ffArray;

      for (const instance of this.env.instances) {
        for (const surface of instance.surfaces) {
          // Get surface reflectance
          const reflect = surface.reflectance;

          for (const patch of surface.patches) {
            // ignore self patch
            if (patch !== currentPatch) {
              for (const element of patch.elements) {
                // Check element visibility
                if (ffArray[element.number] > 0) {
                  // Compute reciprocal form factor
                  const rff = Math.min(ffArray[element.number] * currentPatch.area / element.area, 1);

                  // Get shooting patch unsent exitance
                  shoot.setTo(currentPatch.exitance);

                  // Calculate delta exitance
                  shoot.scale(rff);
                  shoot.multiply(reflect);

                  // Update element exitance
                  element.exitance.add(shoot);

                  // Update patch unsent exitance
                  shoot.scale(element.area / patch.area);
                  patch.exitance.add(shoot);
                }
              }
            }
          }
        }
      }

      // Reset unsent exitance to zero
      currentPatch.exitance.reset();
    }

    // Increment step count
    this.stepCount++;

    // Convergence not achieved yet
    return false;
  }
}
