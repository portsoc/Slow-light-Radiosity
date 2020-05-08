import RadEqnSolve from './radeqnsolve.js';
import HemiCube from './hemicube.js';
import Spectra from './spectra.js';

export default class ProgRad extends RadEqnSolve {
  constructor() {
    super();

    this.ffd = new HemiCube();        // Form factor determination
    this.ffArray = null;              // Form factor array

    this.overFlag = false;            // Overshoot flag
    this.overshoot = new Spectra();   // Overshooting parameters
  }

  open(env) {
    this.env = env;
    this.stepCount = 0;
    this.convergence = 1;
    this.initExitance();

    if (this.ambFlag) {
      this.calcInterReflect();
      this.calcAmbient();
    }

    // Allocate form factor array
    this.ffArray = new Array(this.env.numberElements());

    return true;
  }

  close() {
    // Release form factor array
    this.ffArray = null;
  }

  prepareForDisplay() {
    this.env.interpolateVertexExitances();
  }

  calculate() {
    // Check for maximum number of steps
    if (this.stepCount >= this.maxStep) {
      if (this.ambFlag) this.addAmbient();
      return true;
    }

    // Update unsent flux statistics
    this.updateUnsentStats();

    // Check for convergence
    if (this.convergence < this.stopCriterion) {
      if (this.ambFlag) this.addAmbient();
      return true;
    }

    // Calculate form factors
    this.ffd.calculateFormFactors(this.max, this.env, this.ffArray);

    if (this.overFlag) this.calcOverShoot();

    const shoot = new Spectra();

    for (const instance of this.env.instances) {
      for (const surface of instance.surfaces) {
        // Get surface reflectance
        const reflect = surface.reflectance;

        for (const patch of surface.patches) {
          // ignore self patch
          if (patch !== this.max) {
            for (const element of patch.elements) {
              // Check element visibility
              if (this.ffArray[element.number] > 0) {
                // Compute reciprocal form factor
                const rff = Math.min(this.ffArray[element.number] * this.max.area / element.area, 1);

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
    }

    // Reset unsent exitance to zero
    this.max.exitance.reset();

    if (this.overFlag) this.max.exitance.sub(this.overshoot);

    if (this.ambFlag) this.calcAmbient();

    // Increment step count
    this.stepCount++;

    // Convergence not achieved yet
    return false;
  }

  addAmbient() {
    for (const instance of this.env.instances) {
      for (const surface of instance.surfaces) {
        // Get surface reflectance
        const reflect = surface.reflectance;

        for (const patch of surface.patches) {
          for (const element of patch.elements) {
            // Calculate delta ambient exitance
            const deltaAmb = new Spectra(
              this.ambient.r * reflect.r,
              this.ambient.g * reflect.g,
              this.ambient.b * reflect.b,
            );

            // Update element exitance
            element.exitance.add(deltaAmb);
          }
        }
      }
    }
  }

  calcOverShoot() {
    this.overshoot.reset();
    const unsent = new Spectra();

    for (const instance of this.env.instances) {
      for (const surface of instance.surfaces) {
        for (const patch of surface.patches) {
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
              unsent.scale(this.ffArray[element.number]);

              // Update overshooting paramters
              this.overshoot.add(unsent);
            }
          }
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
