import HemiCube from './hemicube.js';
import Spectra from './spectra.js';

export default class SlowRad {
  constructor(maxTime = 300) {
    this.now = 0;                              // Step count
    this.maxTime = maxTime;                    // Maximum number of steps
    this.env = null;                           // Environment

    this.ambient = new Array(maxTime);         // Ambient future exitances
    for (let i = 0; i < maxTime; i += 1) {
      this.ambient[i] = new Spectra();
    }

    this.irf = new Spectra();                  // Interreflection factors
    this.totalArea = 0;                        // Total patch area

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
        // set the lights to stay on
        patch.futureExitances.forEach(s => s.setTo(emit));

        // Initialize element and vertex future exitances
        for (const element of patch.elements) {
          element.futureExitances.forEach(s => s.reset());
          for (const vertex of element.vertices) {
            vertex.futureExitances.forEach(s => s.reset());
          }
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
      tmp.setTo(patch.futureExitances[this.now]);
      tmp.scale(patch.area);
      sum.add(tmp);
    }

    // Calculate area-weighted average reflectance
    sum.scale(1 / this.totalArea);

    // Calculate interreflectance factors
    this.ambient[this.now].r = this.irf.r * sum.r;
    this.ambient[this.now].g = this.irf.g * sum.g;
    this.ambient[this.now].b = this.irf.b * sum.b;

    return this;
  }

  prepareForDisplay() {
    if (this.now < this.maxTime) {
      if (this.needsDisplayUpdate) {
        this.calcAmbient();
        this.env.ambient = this.ambient[this.now];
        console.log(this.env.ambient);
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
                // compute the time distances between the shooting patch and receiving element
                const distance = currentPatch.distArray[element.number];
                const timeDist = Math.round(distance / this.speedOfLight);
                const receivingTime = this.now + timeDist;

                // only propagate the light if we aren't out of future
                if (receivingTime < this.maxTime) {
                  // Compute reciprocal form factor
                  const rff = Math.min(ffArray[element.number] * currentPatch.area / element.area, 1);

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
