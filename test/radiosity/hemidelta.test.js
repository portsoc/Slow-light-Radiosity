import HemiDelta from '../../radiosity/hemidelta.js';

test('constructor()', () => {
  const res = 100;
  const hd = new HemiDelta(res);

  expect(hd.sideArray).toHaveLength(res / 2);
  expect(hd.topArray).toHaveLength(res / 2);

  for (const arr of hd.sideArray) {
    expect(arr).toHaveLength(res / 2);
  }

  for (const arr of hd.topArray) {
    expect(arr).toHaveLength(res / 2);
  }
});

test('form factors add up to 1', () => {
  const sum10 = sumFactors(10);
  const sum100 = sumFactors(100);
  const sum1000 = sumFactors(1000);

  expect(sum10).toBeCloseTo(1, 1);
  expect(sum100).toBeCloseTo(1, 3);
  expect(sum100).not.toBeCloseTo(1, 4);
  expect(sum1000).toBeCloseTo(1, 5);
});

test('form factors decrease away from the centre', () => {
  const res = 100;
  const hd = new HemiDelta(res);

  for (let row = res / 2 + 1; row < res; row += 1) {
    for (let col = res / 2 + 1; col < res; col += 1) {
      expect(hd.getTopFactor(row, col)).toBeLessThan(hd.getTopFactor(row - 1, col));
      expect(hd.getTopFactor(row, col)).toBeLessThan(hd.getTopFactor(row, col - 1));
    }
  }

  for (let row = res / 2 + 1; row < res; row += 1) {
    for (let col = res / 2 + 1; col < res; col += 1) {
      expect(hd.getSideFactor(row, col)).toBeLessThan(hd.getSideFactor(row, col - 1));
    }
  }
});

test('top form factors are diagonal-symmetrical, side FFs are not', () => {
  const res = 100;
  const hd = new HemiDelta(res);

  for (let row = res / 2; row < res; row += 1) {
    for (let col = row + 1; col < res; col += 1) {
      expect(hd.getTopFactor(row, col)).toEqual(hd.getTopFactor(col, row));
    }
  }

  for (let row = res / 2; row < res; row += 1) {
    for (let col = row + 1; col < res; col += 1) {
      expect(hd.getSideFactor(row, col)).not.toEqual(hd.getSideFactor(col, row));
    }
  }
});

test('form factors are side-symmetrical', () => {
  const res = 100;
  const hd = new HemiDelta(res);

  for (let row = res / 2; row < res; row += 1) {
    for (let col = res / 2; col < res; col += 1) {
      expect(hd.getTopFactor(row, col)).toEqual(hd.getTopFactor(res - 1 - row, col));
      expect(hd.getTopFactor(row, col)).toEqual(hd.getTopFactor(res - 1 - row, res - 1 - col));
      expect(hd.getTopFactor(row, col)).toEqual(hd.getTopFactor(row, res - 1 - col));
    }
  }

  for (let row = res / 2; row < res; row += 1) {
    for (let col = res / 2; col < res; col += 1) {
      expect(hd.getSideFactor(row, col)).toEqual(hd.getSideFactor(row, res - 1 - col));
    }
  }
});

// returns a sum of the form factors across the whole hemicube at resolution res
function sumFactors(res) {
  const hd = new HemiDelta(res);

  let sum = 0;
  for (let row = 0; row < res; row += 1) {
    for (let col = 0; col < res; col += 1) {
      sum += hd.getTopFactor(row, col);
    }
  }

  for (let row = res / 2; row < res; row += 1) {
    for (let col = 0; col < res; col += 1) {
      sum += 4 * hd.getSideFactor(row, col);
    }
  }

  return sum;
}
