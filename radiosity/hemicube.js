import FormPoly from './formpoly.js';
import HemiClip, { FACES } from './hemiclip.js';
import HemiScan from './hemiscan.js';

export default class HemiCube {
  constructor(resolution = 100) {
    this.out = new FormPoly();
    this.clipper = new HemiClip();
    this.scanner = new HemiScan(resolution);
  }

  calculateFormFactors(originPatch, env, ffArray) {
    // Set the hemi-cube view transformations matrix
    this.clipper.setView(originPatch);

    // make sure all the elements in the environment have consecutive numbers
    const numElements = env.numberElements();

    // Clear the form factors array
    ffArray.fill(0, 0, numElements);

    // Project environment onto each hemi-cube face
    // we project the whole environment on each side in turn,
    // adding the contributions in ffArray
    for (const faceId of FACES) {
      // Update view transformation matrix
      this.clipper.updateView(faceId);
      // Clear depth uffer
      this.scanner.initBuffer();

      for (const patch of env.patches) {
        // Determine patch visibility
        const visible = !this.clipper.isFacingAway(patch);
        if (patch !== originPatch && visible) {
          for (const element of patch.elements) {
            // Clip element to face view volume
            this.clipper.clip(element, this.out);

            // Draw the clipped polygon on the hemicube face
            this.scanner.scan(this.out, element.number);
          }
        }
      }
      this.scanner.sumDeltas(ffArray, faceId);
    }
    return this;
  }
}
