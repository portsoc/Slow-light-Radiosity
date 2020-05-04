const MAX_EXITANCE = 254 / 255;
const MIN_VALUE = 1e-10;

export default class ToneRep {
  shade(instanceArray) {
    // Walk the instance list
    for (const instance of instanceArray) {
      // Walk  vertex list
      for (const vertex of instance.vertices) {
        // Set vertex exitance to parent surface reflectance
        vertex.exitance = vertex.elements[0].parentPatch.parentSurface.reflectance;
      }
    }
  }

  interpolate(instanceArray) {
    // Walk the instance list
    for (const instance of instanceArray) {
      // Walk  vertex list
      for (const vertex of instance.vertices) {
        // Initialize vertex reflected exitance
        vertex.exitance.reset();

        // Walk the element list
        for (const element of vertex.elements) {
          // Add element reflected exitance
          vertex.exitance.add(element.exitance);
        }

        // Scale vertex reflected exitance according to number of shared elements
        vertex.exitance.scale(MAX_EXITANCE / vertex.elements.length);
      }
    }
  }

  normalize(instanceArray) {
    let rMax = 0;
    // Walk the instance list
    for (const instance of instanceArray) {
      // Walk  vertex list
      for (const vertex of instance.vertices) {
        // Find maximum reflected color band value
        rMax = Math.max(vertex.exitance.maxColor, rMax);
      }
    }

    // Chekc for non-zero maximum vertex exitance
    if (rMax > MIN_VALUE) {
      // Walk the instance list
      for (const instance of instanceArray) {
      // Walk  vertex list
        for (const vertex of instance.vertices) {
          // Get parent surface emmitance
          const emit = vertex.elements[0].parentPatch.parentSurface.emittance;

          // Add surface initial exitance to reflected vertex exitance
          vertex.exitance.add(emit);

          // Clip vertex exitance
          const eMax = vertex.exitance.maxColor;
          if (eMax > 1) {
            vertex.exitance.scale(1 / eMax);
          }
        }
      }
    }
  }
}
