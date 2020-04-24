import FormPoly from './formpoly.js';
import HemiClip from './hemiclip.js';

const HemiFaceNum = 5;

export default class HemiCube {
  constructor() {
    this.out = new FormPoly();
    this.clip = new HemiClip();
    this.scan = new HemiScan();
  }

  get status() {

  }
}
