const ArrayRes = 100;
const ArrayDim = ArrayRes / 2;

export default class HemiDelta {
  constructor() {
    // Initialize arrays
    this.sideArray = [];
    this.topArray = [];
    for (let i = 0; i < ArrayDim; i++) {
      this.sideArray.push([]);
      this.topArray.push([]);
      for (let j = 0; j < ArrayDim; j++) {
        this.sideArray[i][j] = undefined;
      }
    }

    // Initialize cell dimensions and area
    const dx = 2 / ArrayRes;
    const dy = dx;
    const dz = dx;
    const da = 4 / (ArrayRes ** 2);

    // Calculate faces delta form factors
    let x = dx / 2;
    for (let i = 0; i < ArrayDim; i++) {
      let y = dy / 2;
      let z = dz / 2;
      for (let j = 0; j < ArrayDim; j++) {
        const rt = x ** 2 + y ** 2 + 1;
        const rs = x ** 2 + z ** 2 + 1;
        this.topArray[j][i] = da / (Math.PI * rt ** 2);
        this.sideArray[j][i] = (z * da) / (Math.PI * rs ** 2);
        y += dy;
        z += dy;
      }
      x += dx;
    }
  }

  getTopFactor(row, col) {
    if (row >= ArrayDim) row -= ArrayDim;
    else row = ArrayDim - row - 1;
    if (col >= ArrayDim) col -= ArrayDim;
    else col = ArrayDim - col - 1;
    return this.topArray[row][col];
  }

  getSideFactor(row, col) {
    if (col >= ArrayDim) col -= ArrayDim;
    else col = ArrayDim - col - 1;
    return this.topArray[row - ArrayDim][col];
  }
}
