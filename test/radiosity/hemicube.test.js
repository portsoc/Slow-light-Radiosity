import HemiCube from '../../radiosity/hemicube.js';
import createTwoSameFaces from '../../modeling/test-models/two-faces.js';

test('book section 5.18.1', () => {
  // Initialize environment, must have one element per patch
  const env = createTwoSameFaces();
  const hemi = new HemiCube(100);

  expect(env.elementCount).toBe(2);

  // Allocate form factor array
  const ffArray = new Array(env.elementCount);

  const results = [];

  // Calculate and display form factors from each patch to each other
  for (const instance of env.instances) {
    for (const surface of instance.surfaces) {
      for (const patch of surface.patches) {
        // Calculate patch to element form factor
        hemi.calculateFormFactors(patch, env, ffArray);

        // ffArray is indexed by element.number
        for (let i = 0; i < env.elementCount; i++) {
          results.push(ffArray[i]);
        }
      }
    }
  }

  expect(results).toHaveLength(4);

  // check the results against those reported in the book, page 341
  expect(results[0]).toBe(0); // first patch against its own element
  expect(results[1]).toBeCloseTo(0.24, 2); // first patch against the other
  expect(results[2]).toBeCloseTo(0.24, 2); // second patch against the other
  expect(results[3]).toBe(0); // second patch against its own element
});

test('constructor() default param', () => {
  const hemi = new HemiCube();
  expect(hemi.scanner.resolution).toEqual(expect.any(Number));
  expect(hemi.scanner.resolution).toBeGreaterThan(1);
  expect(hemi.scanner.resolution % 2).toBe(0);
});
