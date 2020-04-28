import FormPoly from './formpoly.js';
import HemiClip from './hemiclip.js';
import HemiScan from './hemiscan.js';

const HemiFaceNum = 5;

export default class HemiCube {
  constructor() {
    this.out = new FormPoly();
    this.clip = new HemiClip();
    this.scan = new HemiScan();
  }

  get status() {
    return this.scan.status;
  }

  calcFormFactors(patch, instArray, array, numElem) {
    // Clear the form factors array
    for (let i = 0; i < numElem; i++) {
      array[i] = 0;
    }

    // Set the hemi-cube view transformations matrix
    this.clip.setView(patch);

    // Project environment onto each hemi-cube face
    for (let i = 0; i < HemiFaceNum; i++) {
      // Update view transformation matrix
      this.clip.updateView(i);
      // Reinitialize depth uffer
      this.scan.initBuffer();
      // Walk the instance list
      let elemId = 1;
      for (const instance of instArray) {
        // Walk the surface list
        for (const surface of instance.surfaces) {
          // Walk the patch list
          for (const _patch of surface.patches) {
            // Check for self patch
            const _self = (_patch === patch);
            // Determine patch visibility
            const hidden = this.clip.isFacingAway(_patch);
            // Walk the element list
            for (const element of _patch.elements) {
              if (!hidden && _self) {
                // Clip element to face view volume
                if (this.clip.clip(element, this.out, elemId) > 0) {
                  this.scan.scan(this.out);
                }
              }
              elemId++;
            }
          }
        }
      }
      this.scan.sumDeltas(array, i);
    }
    return this;
  }
}
