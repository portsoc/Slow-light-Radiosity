export default class HemiDelta {
  constructor(resolution) {
    // a face is a square resolution x resolution big,
    // it is symmetrical so we can only store a quarter of it
    this.arrayDim = resolution / 2;

    // Initialize arrays
    this.sideArray = [];
    this.topArray = [];
    for (let i = 0; i < this.arrayDim; i += 1) {
      this.sideArray.push([]);
      this.topArray.push([]);
    }

    // Initialize cell size and area
    const size = 1 / this.arrayDim;
    const area = 1 / (this.arrayDim ** 2);

    // Calculate faces delta form factors
    // i,j number cells from the centre of the face
    // x,y are the centre of a cell
    // on side face, j (y) goes up from hemicube base
    for (let i = 0; i < this.arrayDim; i += 1) {
      const x = (i + 0.5) * size;
      for (let j = 0; j < this.arrayDim; j += 1) {
        const y = (j + 0.5) * size;
        const r2 = x ** 2 + y ** 2 + 1;
        this.topArray[j][i] = area / (Math.PI * r2 ** 2);
        this.sideArray[j][i] = (y * area) / (Math.PI * r2 ** 2);
      }
    }
  }

  getTopFactor(row, col) {
    if (row >= this.arrayDim) {
      row -= this.arrayDim;
    } else {
      row = this.arrayDim - row - 1;
    }
    if (col >= this.arrayDim) {
      col -= this.arrayDim;
    } else {
      col = this.arrayDim - col - 1;
    }
    return this.topArray[row][col];
  }

  getSideFactor(row, col) {
    if (col >= this.arrayDim) {
      col -= this.arrayDim;
    } else {
      col = this.arrayDim - col - 1;
    }
    return this.sideArray[row - this.arrayDim][col];
  }
}
