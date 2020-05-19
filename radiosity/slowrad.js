import HemiCube from './hemicube.js';
import Spectra from './spectra.js';

export default class SlowRad {
  constructor(maxTime = 300) {
    this.now = 0;                   // Step count
    this.maxTime = maxTime;             // Maximum number of steps
    this.env = null;                // Environment

    this.ambient = new Spectra();   // Ambient exitance
    this.irf = new Spectra();       // Interreflection factors
    this.totalArea = 0;             // Total patch area

    this.ffd = new HemiCube();      // Form factor determination
  }

  open(env, SPEED_OF_LIGHT) {
    this.env = env;

    if (SPEED_OF_LIGHT === undefined) {
      const bounds = this.env.boundingBox;
      const diagonal = bounds[0].dist(bounds[1]);
      this.SPEED_OF_LIGHT = diagonal * 2 / this.maxTime;
    } else {
      this.SPEED_OF_LIGHT = SPEED_OF_LIGHT;
    }

    this.env.numberElements();
    this.now = 0;
    this.env.initializeFutureExitances(this.maxTime);
    this.initExitance();
    this.calcInterReflect();
    this.calcPatchElementDistances();
    return true;
  }

  close() {
    this.prepareForDisplay();
  }

  initExitance() {
    for (const surface of this.env.surfaces) {
      // Get surface emittance
      const emit = surface.emittance;

      for (const patch of surface.patches) {
        // Initialize patch future exitances
        patch.futureExitances.fill(emit);

        for (const element of patch.elements) {
          // Initialize element future exitances
          element.futureExitances.fill(new Spectra());
        }
      }
    }

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
    if (this.now === this.maxTime) {
      return true;
    }

    this.needsDisplayUpdate = true;

    const shoot = new Spectra();

    for (const currentPatch of this.env.patches) {
      if (!currentPatch.ffArray) {
        currentPatch.ffArray = new Array(this.env.elementCount);
        this.ffd.calculateFormFactors(currentPatch, this.env, currentPatch.ffArray);
      }
      const ffArray = currentPatch.ffArray;

      for (const surface of this.env.surfaces) {
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

                // Store element exitance
                const distance = patch.distArray[element.number];
                const timeDist = Math.round(distance / this.SPEED_OF_LIGHT);

                if (this.now + timeDist < 300) {
                  element.futureExitances[this.now + timeDist].add(shoot);
                }

                // Update patch unsent exitance
                shoot.scale(element.area / patch.area);
                patch.exitance.add(shoot);
              }
            }
          }
        }
      }

      // Reset unsent exitance to zero
      currentPatch.exitance.reset();
    }

    // Increase now
    this.now++;

    // Convergence not achieved yet
    return false;
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
  }

  calcPatchElementDistances() {
    for (const currentPatch of this.env.patches) {
      if (currentPatch.distArray) {
        continue; // this patch already has distArray
      }

      const distArray = currentPatch.distArray = new Array(this.env.elementCount).fill(null);

      for (const patch of this.env.patches) {
        // ignore self patch
        if (patch !== currentPatch) {
          for (const element of patch.elements) {
            // calculate patch-element distance
            distArray[element.number] = currentPatch.center.dist(element.center);
          }
        }
      }
    }
  }
}
