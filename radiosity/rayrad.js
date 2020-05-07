import RadEqnSolve from './radeqnsolve.js';
import RayCast from './raycast.js';
import Spectra from './spectra.js';

export default class RayRad extends RadEqnSolve {
  constructor() {
    super();
    this.ffd = new RayCast();
  }

  open(env) {
    this.env = env;
    this.stepCount = 0;
    this.convergence = 1;
    this.initExitance();

    if (this.ambFlag) {
      // Calculate interreflection factor
      this.calcInterReflect();
      // Calculate initial ambient term
      this.calcAmbient();
    }

    return true;
  }

  calculate() {
    // Check for maximum number of steps
    if (this.stepCount >= this.maxStep) {
      if (this.ambFlag) this.addAmbient();
      return true;
    }

    // Update unsent flux statistics
    this.updateUnsetStats();

    // Check for convergence
    if (this.convergence < this.stopCriterion) {
      if (this.ambFlag) this.addAmbient();
      return true;
    }

    // Initialize form factor determination object
    this.ffd.init(this.max);

    // Walk the instance list
    for (const instance of this.env.instances) {
      // Walk the surface list
      for (const surface of instance.surfaces) {
        // Get surface reflectance
        const reflect = surface.reflectance;

        // Walk the patch list
        for (const patch of surface.patches) {
          // Check for self patch
          const _self = (patch === this.max);

          // Walk the element list
          for (const element of patch.elements) {
            if (!_self) {
              // Get shooting patch unsent exitance
              const shoot = this.max.exitance;

              // Reset patch delta exitance
              const pDelta = new Spectra();

              for (const vertex of element.vertices) {
                // Get vertex-to-source form factor
                const vsff = this.ffd.calcFormFactor(vertex, this.env.instances);
                if (vsff > 0) {
                  // Calculate vertex delta exitance
                  const vDelta = new Spectra(
                    reflect.r * vsff * shoot.r,
                    reflect.g * vsff * shoot.g,
                    reflect.b * vsff * shoot.b,
                  );

                  // Update vertex exitance
                  vertex.exitance.add(vDelta);

                  // Update patch delta exitance
                  pDelta.add(vDelta);
                }
              }

              // Update patch unsent exitance
              pDelta.scale(element.area / (element.vertices.length * patch.area));
              patch.exitance.ad(pDelta);
            }
          }
        }
      }
    }

    // Reset unsent exitance to zero
    this.max.exitance.reset();

    if (this.ambFlag) this.calcAmbient();

    // Incremment step count
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
            // Calculate delta ambient exitance
            const deltaAmb = new Spectra(
              this.ambient.r * reflect.r,
              this.ambient.g * reflect.g,
              this.ambient.b * reflect.b,
            );

            for (const vertex of element.vertices) {
              // Update vertex exitance
              vertex.exitance.add(deltaAmb);
            }
          }
        }
      }
    }
  }
}
