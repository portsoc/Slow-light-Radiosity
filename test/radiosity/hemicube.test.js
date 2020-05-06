import HemiCube from '../../radiosity/hemicube.js';
import createTwoSameFaces from '../../modeling/test-models/two-faces.js';

test('book section 5.18.1', () => {
  // Initialize environment, must have one element per patch
  const env = createTwoSameFaces();
  const hemi = new HemiCube(100);

  expect(env.elementCount).toBe(2);

  // Allocate form factor array
  const ffArray = new Array(env.elementCount);

  // Calculate and display form factors from each patch to each other
  for (const instance of env.instances) {
    for (const surface of instance.surfaces) {
      for (const patch of surface.patches) {
        // Calculate patch to element form factor
        hemi.calculateFormFactors(patch, env, ffArray);

        // ffArray is indexed by element.number
        for (let i = 0; i < env.elementCount; i++) {
          const samePatch = patch.elements[0].number === i;
          if (samePatch) {
            expect(ffArray[i]).toBe(0);
          } else {
            // as shown in the book, page 341
            expect(ffArray[i]).toBeCloseTo(0.24, 2);
          }
        }
      }
    }
  }
});
