import * as delays from '../../frontend/tools/delays.js';

describe('bursting', () => {
  beforeEach(() => {
    jest.useFakeTimers('modern');
  });

  test('6*1ms runs', async () => {
    // the rest of the tests relies on this:
    expect(delays.WAIT_MS).toBe(1);

    const startTime = Date.now();

    await awaitDelay(); // the first call does not burst, waits 1ms, with fake timers exactly so
    expect(Date.now()).toBe(startTime + 1);

    // then BURST_MS spins will allow bursting
    for (let i = 0; i < delays.BURST_MS; i += 1) {
      spin(1);
      expect(Date.now()).toBe(startTime + 2 + i);
      await awaitDelay();
      expect(Date.now()).toBe(startTime + 2 + i);
    }

    expect(Date.now()).toBe(startTime + delays.BURST_MS + 1);

    // next 1ms spin should finish the burst
    spin(1);
    expect(Date.now()).toBe(startTime + delays.BURST_MS + 2);

    await awaitDelay();
    expect(Date.now()).toBe(startTime + delays.BURST_MS + 3);

    spin(10);
    expect(Date.now()).toBe(startTime + delays.BURST_MS + 13);

    await awaitDelay();
    expect(Date.now()).toBe(startTime + delays.BURST_MS + 14);

    spin(10);
    expect(Date.now()).toBe(startTime + delays.BURST_MS + 24);

    await awaitDelay();
    expect(Date.now()).toBe(startTime + delays.BURST_MS + 25);

    // having not done anything, it should burst again
    await awaitDelay();
    expect(Date.now()).toBe(startTime + delays.BURST_MS + 25);

    await awaitDelay();
    expect(Date.now()).toBe(startTime + delays.BURST_MS + 25);
  });
});

function spin(ms) {
  jest.advanceTimersByTime(ms);
}

function awaitDelay() {
  const delayPromise = delays.burstingDelay();
  jest.runAllTimers(); // simulate timeouts during await
  return delayPromise;
}
