import delays, { FAST_BURSTS_MS } from '../../frontend/tools/delays.js';

test('delay without param', () => {
  expect(() => delays.delay()).toThrow(TypeError);
});

test('different delays', async () => {
  const spy = jest.spyOn(window, 'setTimeout');

  await delays.delay(1);
  expect(spy).toHaveBeenLastCalledWith(expect.any(Function), 1);

  await delays.delay(2);
  expect(spy).toHaveBeenLastCalledWith(expect.any(Function), 2);

  await delays.delay(1);
  expect(spy).toHaveBeenLastCalledWith(expect.any(Function), 1);

  spy.mockRestore();
});

describe('bursting', () => {
  let spyCanBurstNow;

  beforeEach(() => {
    jest.useFakeTimers('modern');
    spyCanBurstNow = jest.spyOn(delays, 'canBurstNow');
  });

  afterEach(() => {
    spyCanBurstNow.mockRestore();
  });

  test('quick short burst (10 waits)', async () => {
    // we should be able to run 10 times in under 2ms
    for (let i = 0; i < 10; i += 1) {
      await delays.delay(0);
      expect(spyCanBurstNow).toHaveLastReturnedWith(true);
    }
  });

  test('6*1ms runs', async () => {
    // spinning 6*1ms with delays should include at least one
    // first two spins will allow bursting
    await delays.delay(0);
    expect(spyCanBurstNow).toHaveLastReturnedWith(true);
    for (let i = 0; i < FAST_BURSTS_MS; i += 1) {
      spin(1);
      await delays.delay(0);
      expect(spyCanBurstNow).toHaveLastReturnedWith(true);
    }

    // next 1ms spin should finish the burst
    spin(1);

    await awaitDelay(delays);

    expect(spyCanBurstNow).toHaveLastReturnedWith(false);
  });

  test('burst always after 10ms spin', async () => {
    await delays.delay(0); // this should burst as it's the first delay on this instance of Delays
    expect(spyCanBurstNow).toHaveLastReturnedWith(true);

    spin(10);
    await awaitDelay(delays); // should not burst, we need to fake the timers
    expect(spyCanBurstNow).toHaveLastReturnedWith(false);

    spin(10);
    await delays.delay(0); // should burst again
    expect(spyCanBurstNow).toHaveLastReturnedWith(true);
  });
});

test.todo('canceling explicitly');
test.todo('canceling on new delay');
test.todo('cancelIfLongerThan');
test.todo('concurrent independent delays');

function spin(ms) {
  jest.advanceTimersByTime(ms);
}

function awaitDelay(delays, ms = 0) {
  const delayPromise = delays.delay(ms);
  jest.runAllTimers(); // simulate timeouts during await
  return delayPromise;
}
