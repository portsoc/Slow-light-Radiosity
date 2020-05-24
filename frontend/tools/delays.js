/*
 * Class for delaying code with await.
 *
 * Every new call to inst.delay(ms) will cancel the previous one (if any).
 *
 * Normally, you need a single instance (default export), but
 * if you want multiple concurrent delays, create multiple instances.
 */

export const FAST_BURSTS_MS = 5;

export class Delays {
  constructor() {
    this._currentDelayMS = 0;
    this._startedGoingFast = 0;
  }

  delay(ms) {
    this.cancel();

    if (ms == null) throw new TypeError('delay now requires ms parameter');

    this._currentDelayMS = ms;
    if (this.canBurstNow()) return;

    return new Promise(resolve => {
      this._currentTimeoutResolve = resolve;
      setTimeout(() => {
        resolve();
        this._currentTimeoutResolve = null;
      }, ms);
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

  cancelIfLongerThan(ms) {
    // cancel the previous delay if it's longer than the new one
    if (this._currentDelayMS > ms) {
      this.cancel();
    }
  }

  cancel() {
    if (this._currentTimeoutResolve) {
      this._currentTimeoutResolve();
      this._currentTimeoutResolve = null;
    }
  }
}

export default new Delays();
