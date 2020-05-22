/*
 * Class for delaying code with await.
 *
 * Every new call to inst.delay() will cancel the previous one (if any).
 *
 * Normally, you need a single instance (default export), but
 * if you want multiple concurrent delays, create multiple instances.
 */

const commonDelays = [0, 100, 1000];

export const FAST_BURSTS_MS = 5;

export class Delays {
  constructor(delays = commonDelays) {
    this._delays = delays;
    this._currentDelayIndex = 0;
    this._currentDelayMS = delays[0];
    this._startedGoingFast = 0;
  }

  delay(ms = this._currentDelayMS) {
    this.cancel();

    this._currentDelayMS = ms;
    if (this.canBurstNow()) return;

    return new Promise(resolve => {
      this._currentTimeoutResolve = resolve;
      setTimeout(resolve, ms);
    });
  }

  canBurstNow() {
    if (this._currentDelayMS !== 0) {
      // bursts only allowed with delay 0
      return false;
    }

    const currentTime = Date.now();

    if (this._startedGoingFast === 0) {
      // we weren't going fast, so let's
      this._startedGoingFast = currentTime;
      return true;
    } else if ((currentTime - this._startedGoingFast) <= FAST_BURSTS_MS) {
      // we were going fast but we're still within FAST_BURSTS_MS
      return true;
    } else {
      // we were going fast already and it's been too long
      this._startedGoingFast = 0;
      return false;
    }
  }

  selectNextDelay() {
    this._currentDelayIndex = (this._currentDelayIndex + 1) % this._delays.length;
    const newDelay = this._delays[this._currentDelayIndex];

    // cancel the previous delay if it's longer than the new one
    if (newDelay < this._currentDelayMS) {
      this.cancel();
    }

    this._currentDelayMS = newDelay;
    return newDelay;
  }

  selectDelay(ms) {
    let newDelayIndex = this._delays.indexOf(ms);
    if (newDelayIndex < 0) {
      newDelayIndex = 0;
      console.warn(`trying to set delay of ${ms}ms but only ${this._delays} are allowed`);
    }

    const newDelay = this._delays[newDelayIndex];

    // cancel the previous delay if it's longer than the new one
    if (newDelay < this._currentDelayMS) {
      this.cancel();
    }

    this._currentDelayIndex = newDelayIndex;
    this._currentDelayMS = newDelay;
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
