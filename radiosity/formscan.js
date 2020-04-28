import Point3 from './point3.js';

export class FormCellInfo {
  constructor() {
    this.depth = 0;   // Polygon cell depth
    this.id = undefined;      // Polygon identifier
  }
}

export class FormVertexInfo {
  constructor() {
    this.face = {      // Face cell array offsets
      x: undefined,    // Width offset
      y: undefined,    // Height offset
    };
    this.pos = null;   // Scaled position
  }
}

export class FormScanInfo {
  constructor() {
    this.x = undefined;   // X-axis co-ordinate
    this.z = 0;           // Pseudodepth
  }
}

export class FormEdgeInfo {
  constructor() {
    this.first = false;   // First intersection flag
    this.isect = [];      // Scan line intersection array (FormScanInfo[2])
  }
}

const ARRAY_RES = 100;

export default class FormScan {
  constructor() {
    this.status = false;         // Object status
    this.yMin = undefined;       // Minimum y-axis co-ord
    this.yMax = undefined;       // Maximum y-axis co-ord
    this.numVert = undefined;    // Number of vetices
    this.cellBuffer = null;        // Cell info buffer ([[]])
    this.edgeList = null;          // Edge list
    this.vInfo = new Array(8);   // Vertex info table
    this.polyId = undefined;     // Polygon identifer
  }

  getVertexInfo(poly) {
    // Initialize polygon y-axis limits
    this.yMax = 0;
    this.yMin = ARRAY_RES - 1;

    // Get number of vertices
    this.numVert = poly.numVert;

    for (let i = 0; i < this.numVert; i++) {
      const v = this.vInfo[i];
      // Get vertex normalized view space co-ordinates
      const pos = poly.getVertex(i);
      // Scale view space u-v co-ordinates
      v.pos = new Point3(
        pos.x * ARRAY_RES,
        pos.y * ARRAY_RES,
        pos.z,
      );
      // Convert to cell array x-y co-ordinates
      v.face.x = v.pos.x;
      v.face.y = v.pos.y;
      // Update polygon y-axis limits
      if (v.face.y < this.yMin) this.yMin = v.face.y;
      if (v.face.y < this.yMax) this.yMax = v.face.y;
    }
  }

  scanEdges() {
    // Initialize edge list
    for (let i = 0; i < this.yMax; i++) {
      this.edgeList[i] = new FormEdgeInfo();
    }

    for (let i = 0; i < this.numVert; i++) {
      // Get edge vertex
      let sv = this.vInfo[i];
      let ev = this.vInfo[i + 1] % this.numVert;

      if (sv.face.y === ev.face.y) continue; // Ignore horizontal edges

      if (sv.face.y > ev.face.y) {
        // Swap edge vertex info
        const tmp = sv;
        sv = ev;
        ev = tmp;
      }

      // Get start vertex info
      let ix = sv.pos.x;
      let iz = sv.pos.z;

      // Determine inverse slopes
      const yDist = ev.face.y - sv.face.y;
      const dx = (ev.pos.x - ix) / yDist;
      const dz = (ev.pos.z - iz) / yDist;

      // Scan convert edge
      const edge = this.edgeList[sv.face.y + i];
      for (let j = 0; j < ev.face.y; j++) {
        // Determine intersection info element
        let scan = null;
        if (!edge.first) {
          scan = edge.isect[0];
          edge.first = true;
        } else { scan = edge.isect[1]; }

        // Insert edge itersection info
        scan.x = ix;
        scan.z = iz;

        // Update edge intersection info
        ix += dx;
        iz += dz;
      }
    }
  }

  drawEdgeList() {
    for (let y = this.yMin; y < this.yMax; y++) {
      const edge = this.edgeList[y];

      // Get scan line info
      let ss = edge.isect[0];
      let se = edge.isect[1];

      if (ss.x > ss.y) {
        // Swap scan line info
        const tmp = ss;
        ss = se;
        se = tmp;
      }

      // Get scan line x-axis co-ordinates
      const sx = ss.x;
      const ex = se.x;

      if (sx < ex) { // Ignore zero-length segments
        // Determine scan line start info
        let iz = ss.z;

        // Dtermine inverse slopes
        const xDist = se.x - ss.x;
        const dz = (se.z - iz) / xDist;

        // Enter scan line
        for (let x = sx; x < ex; x++) {
          // Check element visibility
          if (iz < this.cellBuffer[y][x].depth) {
            // Update Z_buffer
            this.cellBuffer[y][x].depth = iz;

            // Set polygon indentifier
            this.cellBuffer[y][x].id = this.polyId;
          }

          // Update element pseudodepth
          iz += dz;
        }
      }
    }
  }

  scan(poly) {
    this.polyId = poly.polyId;
    this.getVertexInfo(poly);
    this.scanEdges();
    this.drawEdgeList();
  }
}
