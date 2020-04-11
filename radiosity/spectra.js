export default class Spectra {
  constructor(r = 0, g = 0, b = 0) {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  add(s) {
    this.r += s.r;
    this.g += s.g;
    this.b += s.b;
    return this;
  }

  sub(s) {
    this.r -= s.r;
    this.g -= s.g;
    this.b -= s.b;
    return this;
  }

  get maxColor() {
    return Math.max(this.r, this.g, this.b);
  }

  scale(x) {
    this.r *= x;
    this.g *= x;
    this.b *= x;
    return this;
  }
}
