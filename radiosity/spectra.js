export default class Spectra {
  // accepts three numbers: r, g, b; or one Spectra (copy constructor) (or null)
  constructor(r = 0, g = 0, b = 0) {
    if (r instanceof Spectra) {
      this.r = r.r;
      this.g = r.g;
      this.b = r.b;
    } else if (r == null) {
      this.r = this.g = this.b = 0;
    } else {
      this.r = r;
      this.g = g;
      this.b = b;
    }
  }

  reset() {
    this.r = this.g = this.b = 0;
    return this;
  }

  setTo(s) {
    if (!s) {
      this.reset();
      return this;
    }

    this.r = s.r;
    this.g = s.g;
    this.b = s.b;
    return this;
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

  multiply(s) {
    this.r *= s.r;
    this.g *= s.g;
    this.b *= s.b;
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

  exp(x) {
    this.r **= x;
    this.g **= x;
    this.b **= x;
    return this;
  }
}
