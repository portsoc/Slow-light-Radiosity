import FormScan from '../../radiosity/formscan.js';
import FormPoly from '../../radiosity/formpoly.js';
import Vector4 from '../../radiosity/vector4.js';

test('constructor()', () => {
  const resolution = 120;
  const fs = new FormScan(resolution);

  expect(fs.resolution).toBe(resolution);
  expect(fs.edgeList.length).toBe(resolution);
});

test('getVertexInfo()', () => {
  const resolution = 120;
  const fs = new FormScan(resolution);

  // set up FormPoly
  const poly = new FormPoly();
  poly.addVertex(new Vector4(9, 10, 11, 12));
  poly.addVertex(new Vector4(1, 2, 3, 4));
  poly.addVertex(new Vector4(5, 6, 7, 8));
  poly.addVertex(new Vector4(13, 14, 15, 16));

  fs.getVertexInfo(poly);
  expect(fs.numVert).toBe(poly.numVert);
  expect(fs.yMin).toBe(60);
  expect(fs.yMax).toBe(105);
  expect(fs.vInfo).toMatchObject([
    {
      faceX: 90,
      faceY: 100,
      pos: { x: 90, y: 100, z: 0.9166666666666666 },
    },
    {
      faceX: 30,
      faceY: 60,
      pos: { x: 30, y: 60, z: 0.75 },
    },
    {
      faceX: 75,
      faceY: 90,
      pos: { x: 75, y: 90, z: 0.875 },
    },
    {
      faceX: 97,
      faceY: 105,
      pos: { x: 97.5, y: 105, z: 0.9375 },
    },
    {
      faceX: null,
      faceY: null,
      pos: { x: undefined, y: undefined, z: undefined },
    },
    {
      faceX: null,
      faceY: null,
      pos: { x: undefined, y: undefined, z: undefined },
    },
    {
      faceX: null,
      faceY: null,
      pos: { x: undefined, y: undefined, z: undefined },
    },
    {
      faceX: null,
      faceY: null,
      pos: { x: undefined, y: undefined, z: undefined },
    },
    {
      faceX: null,
      faceY: null,
      pos: { x: undefined, y: undefined, z: undefined },
    },
    {
      faceX: null,
      faceY: null,
      pos: { x: undefined, y: undefined, z: undefined },
    },
  ]);
});

test('scanEdges()', () => {
  const resolution = 12;
  const fs = new FormScan(resolution);

  // set up FormPoly
  const poly = new FormPoly();
  poly.addVertex(new Vector4(9, 10, 11, 12));
  poly.addVertex(new Vector4(1, 2, 3, 4));
  poly.addVertex(new Vector4(5, 6, 7, 8));
  poly.addVertex(new Vector4(13, 14, 15, 16));
  fs.getVertexInfo(poly);

  fs.scanEdges();
  expect(fs.vInfo).toMatchObject([
    {
      faceX: 9,
      faceY: 10,
      pos: { x: 9, y: 10, z: 0.9166666666666666 },
    },
    {
      faceX: 3,
      faceY: 6,
      pos: { x: 3, y: 6, z: 0.75 },
    },
    {
      faceX: 7,
      faceY: 9,
      pos: { x: 7.5, y: 9, z: 0.875 },
    },
    {
      faceX: 9,
      faceY: 10,
      pos: { x: 9.75, y: 10.5, z: 0.9375 },
    },
    {
      faceX: null,
      faceY: null,
      pos: { x: undefined, y: undefined, z: undefined },
    },
    {
      faceX: null,
      faceY: null,
      pos: { x: undefined, y: undefined, z: undefined },
    },
    {
      faceX: null,
      faceY: null,
      pos: { x: undefined, y: undefined, z: undefined },
    },
    {
      faceX: null,
      faceY: null,
      pos: { x: undefined, y: undefined, z: undefined },
    },
    {
      faceX: null,
      faceY: null,
      pos: { x: undefined, y: undefined, z: undefined },
    },
    {
      faceX: null,
      faceY: null,
      pos: { x: undefined, y: undefined, z: undefined },
    },
  ]);

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
    { start: { x: 3, z: 0.75 }, end: { x: 3, z: 0.75 } },
    {
      start: { x: 4.5, z: 0.7916666666666666 },
      end: { x: 4.5, z: 0.7916666666666666 },
    },
    {
      start: { x: 6, z: 0.8333333333333333 },
      end: { x: 6, z: 0.8333333333333333 },
    },
    {
      start: { x: 7.5, z: 0.8749999999999999 },
      end: { x: 7.5, z: 0.875 },
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

test('drawEdgeList()', () => {
  const fs = new FormScan(10);

  function drawEdgeList() {
    fs.drawEdgeList();
  }

  expect(drawEdgeList).toThrowError(TypeError);
});

test('scan()', () => {
  const resolution = 12;
  const fs = new FormScan(resolution);

  // ? Empty FormPoly

  // set up FormPoly
  const poly = new FormPoly();

  expect(fs.scan(poly, 2)).toBe(-1);

  // ? Non-empty FormPoly

  // maybe need to test the function in HemiScan to avoid the
  // draxEdgeList() error
});
