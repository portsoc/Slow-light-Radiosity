/*
 * Class for delaying code with await.
 *
 * Every new call to inst.delay() will cancel the previous one (if any).
 *
 * Normally, you need a single instance (default export), but
 * if you want multiple concurrent delays, create multiple instances.
 */

const commonDelays = [0, 100, 1000];

export class Delays {
  constructor(delays = commonDelays) {
    this._delays = delays;
    this._currentDelayIndex = 0;
    this.currentDelayMS = delays[0];
  }

  delay(ms = this.currentDelayMS) {
    this.cancel();
    return new Promise(resolve => {
      this._currentTimeoutResolve = resolve;
      this.currentDelayMS = ms;
      setTimeout(resolve, ms);
    });
  }

  selectNextDelay() {
    this._currentDelayIndex = (this._currentDelayIndex + 1) % this._delays.length;
    const newDelay = this._delays[this._currentDelayIndex];

    // cancel the previous delay if it's longer than the new one
    if (newDelay < this.currentDelayMS) {
      this.cancel();
    }

    this.currentDelayMS = newDelay;
    return newDelay;
  }

  cancel() {
    if (this._currentTimeoutResolve) {
      this._currentTimeoutResolve();
      this._currentTimeoutResolve = null;
    }
  }
}

export default new Delays();
