import FormScan from './formscan.js';

const Face = {
  TOP: 0,
  FRONT: 1,
  RIGHT: 2,
  BACK: 3,
  LEFT: 4,
};
const _Infinity = 1e10;
const None = 0;
const ArrayRes = 100;

export default class HemiScan extends FormScan {
  constructor() {
    super();

    // * TO DO
  }

  initBuffer() {
    for (let row = 0; row < ArrayRes; row++) {
      for (let col = 0; col < ArrayRes; col++) {
        this.cellBuffer[row][col].depth = _Infinity;
        this.cellBuffer[row][col].id = None;
      }
    }
  }

  sumDeltas(fArray, faceId) {
    if (faceId === Face.TOP) {
      // Scan entire face buffer
      for (let row = 0; row < ArrayRes; row++) {
        for (let col = 0; col < ArrayRes; col++) {
          if ((this.polyId = this.cellBuffer[row][col].id) !== None) {

          }
        }
      }
    }
  }
}
