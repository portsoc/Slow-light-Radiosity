import HemiCube from './hemicube.js';
import Spectra from './spectra.js';
import Point3 from './point3.js';

export default class SlowRad {
  constructor(maxTime = 300) {
    this.now = 0;                              // currently computing this step
    this.maxTime = maxTime;                    // Maximum number of steps
    this.env = null;                           // Environment

    this.ffd = new HemiCube();                 // Form factor determination
    this.tmpCamPos = new Point3();             // Object to hold last camera position
  }

  open(env, speedOfLight) {
    const reset = this.env !== env || (speedOfLight != null && speedOfLight !== this.speedOfLight);

    this.env = env;

    if (speedOfLight == null) {
      const bounds = this.env.boundingBox;
      const diagonal = bounds[0].dist(bounds[1]);
      this.speedOfLight = diagonal * 2 / this.maxTime;
    } else {
      this.speedOfLight = speedOfLight;
    }

    if (reset) {
      this.env.numberElements();
      this.now = 0;
      this.env.initializeFutureExitances(this.maxTime);
      this.initExitance();
    }
    return this.prepGenerator();
  }

  show(time, camPos) {
    const cameraSwitched = (this.lastCameraPosition == null) !== (camPos == null);
    const cameraMoved = this.lastCameraPosition && !this.lastCameraPosition.equals(camPos);
    this.lastCameraPosition = camPos && this.tmpCamPos.setTo(camPos);

    if (this.lastShownTime !== time || cameraSwitched || cameraMoved || this.needsDisplayUpdate) {
      this.lastShownTime = time;
      this.needsDisplayUpdate = false;

      // set vertex colors to their colors from the given time
      for (const vertex of this.env.vertices) {
        const camDist = camPos ? this.getTimeDist(vertex.pos, camPos) : 0;
        vertex.exitance.setTo(vertex.futureExitances[time - camDist]);
      }
      return true;
    }
    return false;
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
      const rffArray = currentPatch.rffArray;

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

    this.env.interpolateVertexExitances(this.now);

    this.now++;

    // Convergence not achieved yet
    return false;
  }

  // calculate reciprocal form factors or return existing ones if already there
  computeRFFArray(patch) {
    if (patch.rffArray) return patch.rffArray;

    const rffArray = patch.rffArray = new Array(this.env.elementCount);
    this.ffd.calculateFormFactors(patch, this.env, rffArray);

    // compute reciprocal form factors
    for (const element of this.env.elements) {
      const i = element.number;
      rffArray[i] = Math.min(rffArray[i] * patch.area / element.area, 1);
    }
  }

  computeDistArray(currentPatch) {
    if (currentPatch.distArray &&
        currentPatch.distArray.speedOfLight === this.speedOfLight) {
      // this patch already has distArray for the current speed of light
      return;
    }

    const distArray = currentPatch.distArray = new Array(this.env.elementCount).fill(null);
    distArray.speedOfLight = this.speedOfLight;

    for (const patch of this.env.patches) {
      // ignore self patch
      if (patch !== currentPatch) {
        for (const element of patch.elements) {
          distArray[element.number] = this.getTimeDist(currentPatch.center, element.center);
        }
      }
    }
  }

  getTimeDist(p1, p2) {
    // calculate patch-element distance
    const dist = p1.dist(p2);

    // transform into integer distance in time steps (minimum 1)
    const timeDist = Math.max(1, Math.round(dist / this.speedOfLight));

    return timeDist;
  }

  initExitance() {
    for (const surface of this.env.surfaces) {
      // Get surface emittance
      const emit = surface.emittance;

      for (const patch of surface.patches) {
        // Initialize patch future exitances
        // set the lights to flash at the beginning
        patch.futureExitances.forEach((s, i) => {
          if (i < 10) {
            s.setTo(emit);
          } else {
            s.reset();
          }
        });

        // Initialize element and vertex future exitances
        for (const element of patch.elements) {
          element.futureExitances.forEach((s, i) => {
            s.setTo(patch.futureExitances[i]);
          });
          for (const vertex of element.vertices) {
            vertex.futureExitances.forEach(s => s.reset());
          }
        }
      }
    }

    return this;
  }

  * prepGenerator() {
    // calculate distances and form factors
    const max = this.env.patchCount;
    let curr = 0;
    yield { curr, max };

    for (const currentPatch of this.env.patches) {
      curr += 1;
      this.computeDistArray(currentPatch);
      this.computeRFFArray(currentPatch);
      yield { curr, max };
    }

    while (!this.calculate()) {
      yield { curr: this.now, max: this.maxTime };
    }
  }
}
