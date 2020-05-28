import HemiCube from './hemicube.js';
import Spectra from './spectra.js';

export default class SlowRad {
  constructor(maxTime = 300) {
    this.now = 0;                              // Step count
    this.maxTime = maxTime;                    // Maximum number of steps
    this.env = null;                           // Environment

    this.ffd = new HemiCube();                 // Form factor determination
  }

  open(env, speedOfLight) {
    this.env = env;

    if (speedOfLight == null) {
      const bounds = this.env.boundingBox;
      const diagonal = bounds[0].dist(bounds[1]);
      this.speedOfLight = diagonal * 2 / this.maxTime;
    } else {
      this.speedOfLight = speedOfLight;
    }

    this.env.numberElements();
    this.now = 0;
    this.env.initializeFutureExitances(this.maxTime);
    this.initExitance();
    this.calcPatchElementDistances();
    return true;
  }

  close() {
    this.prepareForDisplay();
  }

  prepareForDisplay() {
    if (this.now < this.maxTime) {
      if (this.needsDisplayUpdate) {
        this.env.interpolateVertexExitances(this.now);
        this.needsDisplayUpdate = false;

        for (const vertex of this.env.vertices) {
          vertex.exitance.setTo(vertex.futureExitances[this.now]);
        }
      }
    }
  }

  calculate() {
    // Check for maximum number of steps
    if (this.now >= this.maxTime) {
      return true;
    }

    this.needsDisplayUpdate = true;

    const shoot = new Spectra();

    for (const currentPatch of this.env.patches) {
      // calculate form factors
      const rffArray = this.computeRFFArray(currentPatch);

      for (const surface of this.env.surfaces) {
        // Get surface reflectance
        const reflect = surface.reflectance;

        for (const patch of surface.patches) {
          // ignore self patch
          if (patch !== currentPatch) {
            for (const element of patch.elements) {
              // Check element visibility
              if (rffArray[element.number] > 0) {
                // compute when the element would receive the light
                const receivingTime = this.now + currentPatch.distArray[element.number];

                // only propagate the light if we aren't out of future buffer
                if (receivingTime < this.maxTime) {
                  // get reciprocal form factor
                  const rff = rffArray[element.number];

                  // Get shooting patch unsent exitance
                  shoot.setTo(currentPatch.futureExitances[this.now]);

                  // Calculate delta exitance
                  shoot.scale(rff);
                  shoot.multiply(reflect);

                  // Store element exitance
                  element.futureExitances[receivingTime].add(shoot);

                  shoot.scale(element.area / patch.area);
                  patch.futureExitances[receivingTime].add(shoot);
                }
              }
            }
          }
        }
      }

      // Reset unsent exitance to zero
      currentPatch.futureExitances[this.now].reset();
    }

    this.now++;

    // Convergence not achieved yet
    return false;
  }

  // calculate reciprocal form factors or return existing ones if already there
  computeRFFArray(patch) {
    if (patch.rffArray) return patch.rffArray;

    const rffArray = new Array(this.env.elementCount);
    this.ffd.calculateFormFactors(patch, this.env, rffArray);

    // compute reciprocal form factors
    for (const element of this.env.elements) {
      const i = element.number;
      rffArray[i] = Math.min(rffArray[i] * patch.area / element.area, 1);
    }
    patch.rffArray = rffArray;
    return rffArray;
  }

  calcPatchElementDistances() {
    for (const currentPatch of this.env.patches) {
      if (currentPatch.distArray &&
          currentPatch.distArray.speedOfLight === this.speedOfLight) {
        // this patch already has distArray for the current speed of light
        continue;
      }

      const distArray = currentPatch.distArray = new Array(this.env.elementCount).fill(null);
      distArray.speedOfLight = this.speedOfLight;

      for (const patch of this.env.patches) {
        // ignore self patch
        if (patch !== currentPatch) {
          for (const element of patch.elements) {
            // calculate patch-element distance
            const dist = currentPatch.center.dist(element.center);
            // transform into integer distance in time steps (minimum 1)
            const timeDist = Math.max(1, Math.round(dist / this.speedOfLight));
            distArray[element.number] = timeDist;
          }
        }
      }
    }
  }

  initExitance() {
    for (const surface of this.env.surfaces) {
      // Get surface emittance
      const emit = surface.emittance;

      for (const patch of surface.patches) {
        // Initialize patch future exitances
        // set the lights to stay on
        patch.futureExitances.forEach(s => s.setTo(emit));

        // Initialize element and vertex future exitances
        for (const element of patch.elements) {
          element.futureExitances.forEach(s => s.setTo(emit));
          for (const vertex of element.vertices) {
            vertex.futureExitances.forEach(s => s.reset());
          }
        }
      }
    }

    return this;
  }
}
