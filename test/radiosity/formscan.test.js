import FormScan from '../../radiosity/formscan.js';
import FormPoly from '../../radiosity/formpoly.js';
import Vector4 from '../../radiosity/vector4.js';

test('constructor()', () => {
  const resolution = 10;
  const fs = new FormScan(resolution);

  expect(fs.resolution).toBe(resolution);
  expect(fs.edgeList.length).toBe(resolution);

  expect(fs.edgeList).toMatchObject([
    {
      start: { x: null, z: null },
      end: { x: null, z: null },
    },
    {
      start: { x: null, z: null },
      end: { x: null, z: null },
    },
    {
      start: { x: null, z: null },
      end: { x: null, z: null },
    },
    {
      start: { x: null, z: null },
      end: { x: null, z: null },
    },
    {
      start: { x: null, z: null },
      end: { x: null, z: null },
    },
    {
      start: { x: null, z: null },
      end: { x: null, z: null },
    },
    {
      start: { x: null, z: null },
      end: { x: null, z: null },
    },
    {
      start: { x: null, z: null },
      end: { x: null, z: null },
    },
    {
      start: { x: null, z: null },
      end: { x: null, z: null },
    },
    {
      start: { x: null, z: null },
      end: { x: null, z: null },
    },
  ]);
});

test('getVertexInfo()', () => {
  const resolution = 100;
  const fs = new FormScan(resolution);

  // set up FormPoly
  const poly = new FormPoly();

  // use w=1 so the projected points have the same coordinates
  poly.addVertex(new Vector4(0.1, 0.4, 1, 1));
  poly.addVertex(new Vector4(0.3, 0.2, 1, 1));
  poly.addVertex(new Vector4(0.8005, 0.7005, 2, 1));
  poly.addVertex(new Vector4(0.6005, 0.9005, 2, 1));

  fs.getVertexInfo(poly);
  expect(fs.numVert).toBe(poly.numVert);
  expect(fs.yMin).toBe(20);
  expect(fs.yMax).toBe(90);

  compareVertInfo(fs.vInfo[0], 10, 40, 10, 40, 1, fs);
  compareVertInfo(fs.vInfo[1], 30, 20, 30, 20, 1, fs);
  compareVertInfo(fs.vInfo[2], 80, 70, 80.05, 70.05, 2, fs);
  compareVertInfo(fs.vInfo[3], 60, 90, 60.05, 90.05, 2, fs);

  expect(fs.vInfo[4]).toMatchObject({ faceX: null, faceY: null, pos: { x: undefined, y: undefined, z: undefined } });
});

test('scanEdges()', () => {
  const resolution = 10;
  const fs = new FormScan(resolution);

  // set up FormPoly
  const poly = new FormPoly();
  poly.addVertex(new Vector4(0.1, 0.4, 1, 1));
  poly.addVertex(new Vector4(0.3, 0.2, 1, 1));
  poly.addVertex(new Vector4(0.8, 0.7, 2, 1));
  poly.addVertex(new Vector4(0.6, 0.9, 2, 1));

  fs.getVertexInfo(poly);
  fs.scanEdges();

  compareVertInfo(fs.vInfo[0], 1, 4, 1, 4, 1, fs);
  compareVertInfo(fs.vInfo[1], 3, 2, 3, 2, 1, fs);
  compareVertInfo(fs.vInfo[2], 8, 7, 8, 7, 2, fs);
  compareVertInfo(fs.vInfo[3], 6, 9, 6, 9, 2, fs);

  expect(fs.vInfo[4]).toMatchObject({ faceX: null, faceY: null, pos: { x: undefined, y: undefined, z: undefined } });

  // the edges should be scanned like this:
  // y:    x:      z:
  // 2-3   30-20   1-1
  // 2-6   30-70   1-2
  // 7-8   80-70   2-2
  // 4-8   10-50   1-2

  expect(fs.edgeList[0]).toMatchObject({ start: { x: null, z: null }, end: { x: null, z: null } });
  expect(fs.edgeList[1]).toMatchObject({ start: { x: null, z: null }, end: { x: null, z: null } });
  compareEdgeInfo(fs.edgeList[2], 3, 1, 3, 1);
  compareEdgeInfo(fs.edgeList[3], 2, 1, 4, 1.2);
  compareEdgeInfo(fs.edgeList[4], 5, 1.4, 1, 1);
  compareEdgeInfo(fs.edgeList[5], 6, 1.6, 2, 1.2);
  compareEdgeInfo(fs.edgeList[6], 7, 1.8, 3, 1.4);
  compareEdgeInfo(fs.edgeList[7], 8, 2, 4, 1.6);
  compareEdgeInfo(fs.edgeList[8], 7, 2, 5, 1.8);
  compareEdgeInfo(fs.edgeList[9], null, null, null, null);
  expect(fs.edgeList[9]).toMatchObject({ start: { x: null, z: null }, end: { x: null, z: null } });

  // one vertex moved
  poly.reset();
  poly.addVertex(new Vector4(0.2, 0.7, 1, 1));
  poly.addVertex(new Vector4(0.3, 0.2, 1, 1));
  poly.addVertex(new Vector4(0.8, 0.7, 2, 1));
  poly.addVertex(new Vector4(0.6, 0.9, 2, 1));

  fs.getVertexInfo(poly);
  fs.scanEdges();

  compareVertInfo(fs.vInfo[0], 2, 7, 2, 7, 1, fs);
  compareVertInfo(fs.vInfo[1], 3, 2, 3, 2, 1, fs);
  compareVertInfo(fs.vInfo[2], 8, 7, 8, 7, 2, fs);
  compareVertInfo(fs.vInfo[3], 6, 9, 6, 9, 2, fs);

  expect(fs.vInfo[4]).toMatchObject({ faceX: null, faceY: null, pos: { x: undefined, y: undefined, z: undefined } });

  // the edges should be scanned like this:
  // y:    x:    z:
  // 2-7   3-2   1-1
  // 2-7   3-8   1-2
  // 7-9   8-6   2-2
  // 7-9   2-6   1-2

  expect(fs.edgeList[0]).toMatchObject({ start: { x: null, z: null }, end: { x: null, z: null } });
  expect(fs.edgeList[1]).toMatchObject({ start: { x: null, z: null }, end: { x: null, z: null } });
  compareEdgeInfo(fs.edgeList[2], 3, 1, 3, 1);
  compareEdgeInfo(fs.edgeList[3], 2.8, 1, 4, 1.2);
  compareEdgeInfo(fs.edgeList[4], 2.6, 1, 5, 1.4);
  compareEdgeInfo(fs.edgeList[5], 2.4, 1, 6, 1.6);
  compareEdgeInfo(fs.edgeList[6], 2.2, 1, 7, 1.8);
  compareEdgeInfo(fs.edgeList[7], 8, 2, 2, 1);
  compareEdgeInfo(fs.edgeList[8], 7, 2, 4, 1.5);
  compareEdgeInfo(fs.edgeList[9], null, null, null, null);
  expect(fs.edgeList[9]).toMatchObject({ start: { x: null, z: null }, end: { x: null, z: null } });
});

test('drawEdgeList()', () => {
  const fs = new FormScan(10);

  expect(() => fs.drawEdgeList()).toThrowError(TypeError);
});

test('scan()', () => {
  const resolution = 12;
  const fs = new FormScan(resolution);

  // Empty FormPoly
  const poly = new FormPoly();
  expect().toBeUndefined();

  // Non-empty FormPoly is fully tested in HemiScan
  poly.addVertex(new Vector4(0.1, 0.4, 1, 1));
  expect(() => fs.scan(poly, 2)).toThrowError(TypeError);
});

function compareVertInfo(vInfo, faceX, faceY, x, y, z, fs) {
  expect(Number.isInteger(vInfo.faceX)).toBe(true);
  expect(Number.isInteger(vInfo.faceY)).toBe(true);
  expect(vInfo.faceY).toBeGreaterThanOrEqual(fs.yMin);
  expect(vInfo.faceY).toBeLessThanOrEqual(fs.yMax);
  expect(vInfo.faceX).toBe(faceX);
  expect(vInfo.faceY).toBe(faceY);
  expect(vInfo.pos.x).toBeCloseTo(x, 5);
  expect(vInfo.pos.y).toBeCloseTo(y, 5);
  expect(vInfo.pos.z).toBeCloseTo(z, 5);
}

function compareEdgeInfo(eInfo, x1, z1, x2, z2) {
  if (x1 == null) expect(eInfo.start.x).toBeNull(); else expect(eInfo.start.x).toBeCloseTo(x1, 5);
  if (z1 == null) expect(eInfo.start.z).toBeNull(); else expect(eInfo.start.z).toBeCloseTo(z1, 5);
  if (x2 == null) expect(eInfo.end.x).toBeNull(); else expect(eInfo.end.x).toBeCloseTo(x2, 5);
  if (z2 == null) expect(eInfo.end.z).toBeNull(); else expect(eInfo.end.z).toBeCloseTo(z2, 5);
}
