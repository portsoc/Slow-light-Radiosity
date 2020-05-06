import FormScan from './formscan.js';
import HemiDelta from './hemidelta.js';
import { TOP } from './hemiclip.js';

export class FormCellInfo {
  reset() {
    this.depth = Infinity;      // Polygon cell depth
    this.polyId = null;  // Polygon identifier
  }
}

export default class HemiScan extends FormScan {
  constructor(resolution) {
    super(resolution);

    this.dff = new HemiDelta(resolution);

    // Initialize cell buffer - 2d array of FormCellInfo
    this.cellBuffer = [];
    for (let i = 0; i < resolution; i++) {
      const row = [];
      for (let j = 0; j < resolution; j++) {
        row[j] = new FormCellInfo();
      }
      this.cellBuffer[i] = row;
    }
  }

  initBuffer() {
    for (let row = 0; row < this.resolution; row++) {
      for (let col = 0; col < this.resolution; col++) {
        this.cellBuffer[row][col].reset();
      }
    }
  }

  drawEdgeList(polyId) {
    for (let y = this.yMin; y < this.yMax; y++) {
      const edge = this.edgeList[y];

      // Get scan line info, scan start and end
      let ss = edge.start;
      let se = edge.end;

      if (ss.x > se.x) {
        // Swap scan line info
        [ss, se] = [se, ss];
      }

      // Get scan line x-axis co-ordinates
      const sx = Math.trunc(ss.x);
      const ex = Math.trunc(se.x);

      if (sx < ex) { // Ignore zero-length segments
        // Determine inverse slopes
        const xDist = se.x - ss.x;
        const dz = (se.z - ss.z) / xDist;

        // Determine scan line start info
        let iz = ss.z;

        // Enter scan line
        for (let x = sx; x < ex; x++) {
          const cell = this.cellBuffer[y][x];

          // Check element visibility
          if (iz < cell.depth) {
            // update z buffer with new depth and polygon ID
            cell.depth = iz;
            cell.polyId = polyId;
          }
          // Update element pseudodepth
          iz += dz;
        }
      }
    }
  }

  sumDeltas(ffArray, faceId) {
    if (faceId === TOP) {
      // Scan entire face buffer
      for (let row = 0; row < this.resolution; row++) {
        for (let col = 0; col < this.resolution; col++) {
          const polyId = this.cellBuffer[row][col].polyId;
          if (polyId != null) {
            ffArray[polyId] += this.dff.getTopFactor(row, col);
          }
        }
      }
    } else {
      // Scan upper half of face buffer only
      for (let row = this.resolution / 2; row < this.resolution; row++) {
        for (let col = 0; col < this.resolution; col++) {
          const polyId = this.cellBuffer[row][col].polyId;
          if (polyId != null) {
            ffArray[polyId] += this.dff.getSideFactor(row, col);
          }
        }
      }
    }
  }
}
