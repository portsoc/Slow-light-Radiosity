import FormScan, { FormEdgeInfo, FormCellInfo } from './formscan.js';
import HemiDelta from './hemidelta.js';

const FACE = {
  TOP: 0,
  FRONT: 1,
  RIGHT: 2,
  BACK: 3,
  LEFT: 4,
};
const INFINITY = 1e10;
const NONE = 0;
const ARRAY_RES = 100;
const ARRAY_DIM = ARRAY_RES / 2;

export default class HemiScan extends FormScan {
  constructor() {
    super();
    this.dff = new HemiDelta(ARRAY_RES);
    this.status = true;

    // Initialize edge list
    this.edgeList = new Array(ARRAY_RES);
    for (let i = 0; i < ARRAY_RES; i++) {
      this.edgeList[i] = new FormEdgeInfo();
    }

    // Initialize cell buffer
    this.cellBuffer = new Array(ARRAY_RES);
    for (let i = 0; i < ARRAY_RES; i++) {
      const a = new Array(ARRAY_RES);
      for (let j = 0; j < ARRAY_RES; j++) {
        a[j] = new FormCellInfo();
      }
      this.cellBuffer[i].push(a);
    }
  }

  initBuffer() {
    for (let row = 0; row < ARRAY_RES; row++) {
      for (let col = 0; col < ARRAY_RES; col++) {
        this.cellBuffer[row][col].depth = INFINITY;
        this.cellBuffer[row][col].id = NONE;
      }
    }
  }

  sumDeltas(array, faceId) {
    if (faceId === FACE.TOP) {
      // Scan entire face buffer
      for (let row = 0; row < ARRAY_RES; row++) {
        for (let col = 0; col < ARRAY_RES; col++) {
          if ((this.polyId = this.cellBuffer[row][col].id) !== NONE) {
            array[this.polyId - 1] += this.dff.getTopFactor(row, col);
          }
        }
      }
    } else {
      // Scan upper half of face buffer only
      for (let row = ARRAY_DIM; row < ARRAY_RES; row++) {
        for (let col = 0; col < ARRAY_RES; col++) {
          if ((this.polyId = this.cellBuffer[row][col].id) !== NONE) {
            array[this.polyId - 1] += this.dff.getSideFactor(row, col);
          }
        }
      }
    }
  }
}
