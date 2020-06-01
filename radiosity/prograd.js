import RadEqnSolve from './radeqnsolve.js';
import HemiCube from './hemicube.js';
import Spectra from './spectra.js';

export default class ProgRad extends RadEqnSolve {
  constructor() {
    super();

    this.ffd = new HemiCube();        // Form factor determination

    this.overFlag = false;            // Overshoot flag
    this.overshoot = new Spectra();   // Overshooting parameters
  }

  open(env) {
    this.env = env;
    this.env.numberElements();
    this.stepCount = 0;
    this.maxTime = this.maxStep;
    this.convergence = 1;
    this.initExitance();
    this.calcInterReflect();
    return true;
  }

  close() {
    this.prepareForDisplay();
    this.maxTime = this.stepCount;
  }

  prepareForDisplay() {
    if (this.needsDisplayUpdate) {
      this.calcAmbient();
      this.env.ambient = this.ambient;
      this.env.interpolateVertexExitances();
      this.needsDisplayUpdate = false;
    }
  }

  show(time) {
    if (!this.env) return;

    if (time < this.stepCount) {
      this.open(this.env);
      this.needsDisplayUpdate = true;
    }

    while (this.stepCount < time) {
      if (this.calculate()) break;
    }

    this.prepareForDisplay();
    return this.stepCount;
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

    // Calculate form factors if not done before
    if (!this.max.ffArray) {
      this.max.ffArray = new Array(this.env.elementCount);
      this.ffd.calculateFormFactors(this.max, this.env, this.max.ffArray);
    }

    const ffArray = this.max.ffArray;
    if (this.overFlag) this.calcOverShoot(ffArray);

    const shoot = new Spectra();

    for (const surface of this.env.surfaces) {
      // Get surface reflectance
      const reflect = surface.reflectance;

      for (const patch of surface.patches) {
        // ignore self patch
        if (patch !== this.max) {
          for (const element of patch.elements) {
            // Check element visibility
            if (ffArray[element.number] > 0) {
              // Compute reciprocal form factor
              const rff = Math.min(ffArray[element.number] * this.max.area / element.area, 1);

              // Get shooting patch unsent exitance
              shoot.setTo(this.max.exitance);

              if (this.overFlag) shoot.add(this.overshoot);

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

    // Reset unsent exitance to zero
    this.max.exitance.reset();

    if (this.overFlag) this.max.exitance.sub(this.overshoot);

    // Increment step count
    this.stepCount++;

    // Convergence not achieved yet
    return false;
  }

  calcOverShoot(ffArray) {
    this.overshoot.reset();
    const unsent = new Spectra();

    for (const patch of this.env.patches) {
      // ignore self patch
      if (patch !== this.max) {
        for (const element of patch.elements) {
          // Get unsent exitance
          unsent.setTo(patch.exitance);
          // Ensure unsent exitance is positive in each color band
          if (unsent.r < 0) unsent.r = 0;
          if (unsent.g < 0) unsent.g = 0;
          if (unsent.b < 0) unsent.b = 0;

          // Multiply unsent exitance by patch-to-element form factor
          unsent.scale(ffArray[element.number]);

          // Update overshooting paramters
          this.overshoot.add(unsent);
        }
      }
    }

    // Get shooting patch reflectance
    const spr = this.max.parentSurface.reflectance;

    // Multiply overshooting parameters by shooting patch reflectance
    this.overshoot.r *= spr.r;
    this.overshoot.g *= spr.g;
    this.overshoot.b *= spr.b;
  }
}
