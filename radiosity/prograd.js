import RadEqnSolve from './radeqnsolve.js';
import HemiCube from './hemicube.js';
import Spectra from './spectra.js';

export default class ProgRad extends RadEqnSolve {
  constructor() {
    super();
    this.overFlag = true;             // Overshoot flag
    this.ffArray = null;              // Form factor array
    this.ffd = new HemiCube();        // Form factor determination
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

    if (this.env != null) {
      // Interpolate vertex exitances
      this.tone.interpolate(this.env.instances);

      // Normalize vertex exitances
      this.tone.normalize(this.env.instances);
    }
  }

  calculate() {
    let ffIndex = 0;
    let rff;

    // Check for maximum number of steps
    if (this.stepCount >= this.maxStep) {
      if (this.ambFlag) this.addAmbient();
      return true;
    }

    // Update unsent flux statistics
    this.updateUnsentStats();

    // ! DEBUG
    console.log(this.max);


    // Check for convergence
    if (this.convergence < this.stopCriterion) {
      if (this.ambFlag) this.addAmbient();
      return true;
    }

    // Calculate form factors
    this.ffd.calculateFormFactors(this.max, this.env, this.ffArray);

    if (this.overFlag) this.calcOverShoot();

    // Walk the instance list
    for (const instance of this.env.instances) {
      // Walk the surface list
      for (const surface of instance.surfaces) {
        // Get surface reflectance
        const reflect = surface.reflectance;

        // Walk the patch list
        for (const patch of surface.patches) {
          // Check for self patch
          const self = (patch === this.max);

          // Walk the element list
          for (const element of patch.elements) {
            // Ignore self
            if (!self) {
              // Check element visibility
              if (this.ffArray[ffIndex] > 0) {
                // Compute reciprocal form factor
                rff = Math.min(this.ffArray[ffIndex] * this.max.area / element.area, 1);
              }

              // Get shooting patch unsent exitance
              const shoot = this.max.exitance;

              if (this.overFlag) shoot.add(this.overshoot);

              // Calculate delta exitance
              const delta = new Spectra(
                reflect.r * rff * shoot.r,
                reflect.g * rff * shoot.g,
                reflect.b * rff * shoot.b,
              );

              // Update element exitance
              element.exitance.add(delta);

              // Update patch unsesnt exitance
              delta.scale(element.area / patch.exitance.area);
              patch.exitance.add(delta);
            }

            // Increment form factor index
            ffIndex++;
          }
        }
      }
    }

    // Reset unsent exitance to zero
    this.max.exitance.reset();

    if (this.overFlag) this.max.exitance.sub(this.overshoot);

    if (this.ambFlag) this.calcAmbient();

    // Incremetn step count
    this.stepCount++;

    // Convergence not achieved yet
    return false;
  }

  addAmbient() {
    // Walk the instance list
    for (const instance of this.env.instances) {
      // Walk the surface list
      for (const surface of instance.surfaces) {
        // Get surface reflectance
        const reflect = surface.reflectance;

        // Walk the patch list
        for (const patch of surface.patches) {
          // Walk the element list
          for (const element of patch.elements) {
            // Calculate dela ambient exitance
            const deltaAmb = new Spectra(
              this.ambient.r * reflect.r,
              this.ambient.g * reflect.g,
              this.ambient.b * reflect.b,
            );

            // Update element exitence
            element.exitance.add(deltaAmb);
          }
        }
      }
    }
  }

  calcOverShoot() {
    // Rest overshooting parameters
    this.overshoot.reset();

    // Walk the instance list
    for (const instance of this.env.instances) {
      // Walk the surface list
      for (const surface of instance.surfaces) {
        // Walk the patch list
        for (const patch of surface.patches) {
          // Check for self patch
          const self = (patch === this.max);

          // Walk the element list
          for (let ffIndex = 0; ffIndex < patch.elements.length; ffIndex++) {
            if (!self) {
              // Get unsent exitance
              const unsent = patch.exitance;
              // Ensure unsent exitance is positive in each color band
              if (unsent.r < 0) unsent.r = 0;
              if (unsent.g < 0) unsent.g = 0;
              if (unsent.b < 0) unsent.b = 0;

              // Multiply unsent exitance by patch-to-element form factor
              unsent.scale(this.ffArray[ffIndex]);

              // Update overshooting paramters
              this.overshoot.add(unsent);
            }
          }
        }
      }
    }

    // Get shooting patch reflectance
    const spr = this.max.parentSurface.reflectance;

    // Multiply overshooting parameters by shootingpatch reflectance
    this.overshoot.r *= spr.r;
    this.overshoot.g *= spr.g;
    this.overshoot.b *= spr.b;
  }
}
