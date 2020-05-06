import HemiScan, { FormCellInfo } from '../../radiosity/hemiscan.js';
import HemiDelta from '../../radiosity/hemidelta.js';
import FormPoly from '../../radiosity/formpoly.js';
import Vector4 from '../../radiosity/vector4.js';
import { TOP, LEFT } from '../../radiosity/hemiclip.js';

test('constructor()', () => {
  const res = 10;
  const hs = new HemiScan(res);

  expect(hs.dff).toBeInstanceOf(HemiDelta);
  expect(hs.dff.sideArray).toHaveLength(res / 2);

  // todo check data array
  expect(hs.cellBuffer).toHaveLength(res);
  for (const cellRow of hs.cellBuffer) {
    expect(cellRow).toHaveLength(res);
    for (const cell of cellRow) {
      expect(cell).toBeInstanceOf(FormCellInfo);
    }
  }
});

test('initBuffer()', () => {
  const res = 10;
  const hs = new HemiScan(res);
  for (const cellRow of hs.cellBuffer) {
    for (const cell of cellRow) {
      expect(cell.depth).not.toBeDefined();
    }
  }
  // pollute the cell buffer
  hs.cellBuffer[0][0].polyId = 'should be gone';

  // reset it
  hs.initBuffer();

  // check the size hasn't changed and cells are reset
  expect(hs.cellBuffer).toHaveLength(res);
  for (const cellRow of hs.cellBuffer) {
    expect(cellRow).toHaveLength(res);
    for (const cell of cellRow) {
      expect(cell.depth).toBe(Infinity);
      expect(cell.polyId).toBe(null);
    }
  }
});

test('drawEdgeList()', () => {
  const res = 5;
  const hs = new HemiScan(res);
  hs.initBuffer();

  hs.yMin = 1;
  hs.yMax = 2;
  const edge1 = hs.edgeList[1];
  edge1.start.x = 1;
  edge1.start.z = 5;
  edge1.end.x = 5;
  edge1.end.z = 1;

  hs.drawEdgeList(0);

  const _ = i(null, Infinity);
  const expected1 = [
    [_, _, _, _, _], // 4
    [_, _, _, _, _], // 3
    [_, _, _, _, _], // 2
    [_, i(0, 5), i(0, 4), i(0, 3), i(0, 2)], // 1
    [_, _, _, _, _], // 0
  ];
  expected1.reverse();

  expect(hs.cellBuffer).toEqual(expected1);

  edge1.start.x = 4;
  edge1.start.z = 4.5;
  edge1.end.x = 0;
  edge1.end.z = 4.5;
  hs.drawEdgeList(1);

  const expected1b = [
    [_, _, _, _, _], // 4
    [_, _, _, _, _], // 3
    [_, _, _, _, _], // 2
    [i(1, 4.5), i(1, 4.5), i(0, 4), i(0, 3), i(0, 2)], // 1
    [_, _, _, _, _], // 0
  ];
  expected1b.reverse();
  expect(hs.cellBuffer).toEqual(expected1b);

  hs.yMax = 3;
  const edge2 = hs.edgeList[2];
  edge2.start.x = 4;
  edge2.start.z = 4.5;
  edge2.end.x = 0;
  edge2.end.z = 4.5;
  hs.drawEdgeList(2);

  const expected2 = [
    [_, _, _, _, _], // 4
    [_, _, _, _, _], // 3
    [i(2, 4.5), i(2, 4.5), i(2, 4.5), i(2, 4.5), _], // 2
    [i(1, 4.5), i(1, 4.5), i(0, 4), i(0, 3), i(0, 2)], // 1
    [_, _, _, _, _], // 0
  ];
  expected2.reverse();

  expect(hs.cellBuffer).toEqual(expected2);
});

// create an object that mirrors a FormCellInfo instance
function i(polyId, depth) {
  return { depth, polyId };
}

test('scan()', () => {
  //    0 1 2 3 4 5 6 7 8 9
  // 9  _ _ 1 1 1 1 _ _ _ _
  // 8  _ _ 1 1 1 1 _ _ _ _
  // 7  _ _ 1 1 1 1 _ _ _ _
  // 6  _ _ 1 1 1 1 _ _ _ _
  // 5  _ _ 1 1 1 1 _ _ _ _
  // 4  3 3 3 3 3 3 3 3 3 3
  // 3  2 2 2 2 0 0 0 0 2 2
  // 2  _ _ 0 0 0 0 0 0 _ _
  // 1  0 0 0 0 0 0 0 0 _ _
  // 0  _ _ 1 1 1 1 _ _ _ _
  //
  // 0 vertices: 0,1 8,1 8,5 z=1
  // 1 vertices: 2,0 6,0 6,10 2,10 z=2
  // 2 vertices: 0,3 10,3 10,4 z=1.5
  // 3 vertices: 0,3 10,4 0,5 z=0.9

  const res = 10;
  const hs = new HemiScan(res);
  hs.initBuffer();

  const poly = new FormPoly();
  poly.addVertex(new Vector4(0, 1, 1, 10));
  poly.addVertex(new Vector4(8, 1, 1, 10));
  poly.addVertex(new Vector4(8, 5, 1, 10));
  hs.scan(poly, 0);

  poly.reset();
  poly.addVertex(new Vector4(2, 0, 2, 10));
  poly.addVertex(new Vector4(6, 0, 2, 10));
  poly.addVertex(new Vector4(6, 10, 2, 10));
  poly.addVertex(new Vector4(2, 10, 2, 10));
  hs.scan(poly, 1);

  poly.reset();
  poly.addVertex(new Vector4(0, 3, 1.5, 10));
  poly.addVertex(new Vector4(10, 3, 1.5, 10));
  poly.addVertex(new Vector4(10, 4, 1.5, 10));
  hs.scan(poly, 2);

  poly.reset();
  poly.addVertex(new Vector4(0, 3, 0.9, 10));
  poly.addVertex(new Vector4(10, 4, 0.9, 10));
  poly.addVertex(new Vector4(0, 5, 0.9, 10));
  hs.scan(poly, 3);

  const _ = null;
  const expected = [
    [_, _, 1, 1, 1, 1, _, _, _, _], // 9
    [_, _, 1, 1, 1, 1, _, _, _, _], // 8
    [_, _, 1, 1, 1, 1, _, _, _, _], // 7
    [_, _, 1, 1, 1, 1, _, _, _, _], // 6
    [_, _, 1, 1, 1, 1, _, _, _, _], // 5
    [3, 3, 3, 3, 3, 3, 3, 3, 3, 3], // 4
    [2, 2, 2, 2, 0, 0, 0, 0, 2, 2], // 3
    [_, _, 0, 0, 0, 0, 0, 0, _, _], // 2
    [0, 0, 0, 0, 0, 0, 0, 0, _, _], // 1
    [_, _, 1, 1, 1, 1, _, _, _, _], // 0
  ];
  expected.reverse();

  expect(hs.cellBuffer.map(row => row.map(cell => cell.polyId))).toEqual(expected);
});

test('sumDeltas()', () => {
  const ffArray = [0, 0, 0];

  const res = 10;
  const hs = new HemiScan(res);
  const hd = new HemiDelta(res);

  // set the cell buffer
  hs.cellBuffer[0][0].polyId = 0;
  hs.cellBuffer[1][2].polyId = 0;
  hs.cellBuffer[3][5].polyId = 0;

  hs.cellBuffer[4][5].polyId = 1;

  hs.cellBuffer[5][5].polyId = 2;
  hs.cellBuffer[6][7].polyId = 2;

  const ffTop = [
    hd.getTopFactor(0, 0) + hd.getTopFactor(1, 2) + hd.getTopFactor(3, 5),
    hd.getTopFactor(4, 5),
    hd.getTopFactor(5, 5) + hd.getTopFactor(6, 7),
  ];

  const ffSide = [
    0, // sides of the hemicube ignore rows under res/2
    0,
    hd.getSideFactor(5, 5) + hd.getSideFactor(6, 7),
  ];

  hs.sumDeltas(ffArray, TOP);
  expect(ffArray).toEqual(ffTop);

  ffArray.fill(0);
  hs.sumDeltas(ffArray, TOP);
  expect(ffArray).toEqual(ffTop);

  ffArray.fill(0);
  hs.sumDeltas(ffArray, LEFT);
  expect(ffArray).toEqual(ffSide);
});
