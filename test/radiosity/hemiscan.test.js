import HemiScan, { FormCellInfo } from '../../radiosity/hemiscan.js';
import HemiDelta from '../../radiosity/hemidelta.js';
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
      expect(cell.depth).toBe(0);
      expect(cell.polyId).toBe(null);
    }
  }
});

test.todo('drawEdgeList()');

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
