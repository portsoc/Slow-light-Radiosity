import FormScan, { FormEdgeInfo, FormCellInfo } from './formscan.js';
import HemiDelta from './hemidelta.js';

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
const ArrayDim = ArrayRes / 2;

export default class HemiScan extends FormScan {
  constructor() {
    super();
    this.dff = new HemiDelta(ArrayRes);
    this.status = true;

    // Initialize edge list
    this.edgeList = new Array(ArrayRes);
    for (let i = 0; i < ArrayRes; i++) {
      this.edgeList[i] = new FormEdgeInfo();
    }

    // Initialize cell buffer
    this.cellBuffer = new Array(ArrayRes);
    for (let i = 0; i < ArrayRes; i++) {
      const a = new Array(ArrayRes);
      for (let j = 0; j < ArrayRes; j++) {
        a[j] = new FormCellInfo();
      }
      this.cellBuffer[i].push(a);
    }
  }

  initBuffer() {
    for (let row = 0; row < ArrayRes; row++) {
      for (let col = 0; col < ArrayRes; col++) {
        this.cellBuffer[row][col].depth = _Infinity;
        this.cellBuffer[row][col].id = None;
      }
    }
  }

  sumDeltas(array, faceId) {
    if (faceId === Face.TOP) {
      // Scan entire face buffer
      for (let row = 0; row < ArrayRes; row++) {
        for (let col = 0; col < ArrayRes; col++) {
          if ((this.polyId = this.cellBuffer[row][col].id) !== None) {
            array[this.polyId - 1] += this.dff.getTopFactor(row, col);
          }
        }
      }
    } else {
      // Scan upper half offace buffer only
      for (let row = ArrayDim; row < ArrayRes; row++) {
        for (let col = 0; col < ArrayRes; col++) {
          if ((this.polyId = this.cellBuffer[row][col].id) !== None) {
            array[this.polyId - 1] += this.dff.getSideFactor(row, col);
          }
        }
      }
    }
  }
}
