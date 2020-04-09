export default class Spectra {
  constructor(redBand = 0, greenBand = 0, blueBand = 0) {
    this.redBand = redBand;
    this.blueBand = blueBand;
    this.greenBand = greenBand;
  }

  add(s) {
    this.redBand += s.redBand;
    this.blueBand += s.blueBand;
    this.greenBand += s.blueBand;
    return this;
  }

  sub(s) {
    this.redBand -= s.redBand;
    this.blueBand -= s.blueBand;
    this.greenBand -= s.blueBand;
    return this;
  }

  static blend(s1, s2, alpha) {
    const s3 = new Spectra(0, 0, 0);
    s3.redBand = s1.redBand + (s2.redBand - s1.redBand) * alpha;
    s3.greenBand = s1.greenBand + (s2.greenBand - s1.greenBand) * alpha;
    s3.blueBand = s1.blueBand + (s2.blueBand - s1.blueBand) * alpha;
    return s3;
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
