export default class Spectra {
  constructor(redBand = 0, greenBand = 0, blueBand = 0) {
    this.redBand = redBand;
    this.blueBand = blueBand;
    this.greenBand = greenBand;
  }

  add(s) {
    this.redBand += s.redBand;
    this.blueBand += s.blueBand;
    this.greenBand += s.greenBand;
    return this;
  }

  sub(s) {
    this.redBand -= s.redBand;
    this.blueBand -= s.blueBand;
    this.greenBand -= s.greenBand;
    return this;
  }

  get maxColor() {
    return Math.max(this.redBand, this.greenBand, this.blueBand);
  }

  scale(s) {
    this.redBand *= s;
    this.blueBand *= s;
    this.greenBand *= s;
    return this;
  }
}
