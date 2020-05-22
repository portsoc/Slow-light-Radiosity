import delays, { Delays, FAST_BURSTS_MS } from '../../frontend/tools/delays.js';

test('default delays', () => {
  expect(delays).toBeDefined();
  expect(delays._delays).toStrictEqual([0, 100, 1000]);
});

test('10 and 100ms', async () => {
  const del = new Delays([1, 2]);
  const spy = jest.spyOn(window, 'setTimeout');

  await del.delay();
  expect(spy).toHaveBeenLastCalledWith(expect.any(Function), 1);

  del.selectNextDelay();
  await del.delay();
  expect(spy).toHaveBeenLastCalledWith(expect.any(Function), 2);

  del.selectNextDelay();
  await del.delay();
  expect(spy).toHaveBeenLastCalledWith(expect.any(Function), 1);

  spy.mockRestore();
});

test('selectDelay()', async () => {
  const del = new Delays([1, 2]);
  const spy = jest.spyOn(window, 'setTimeout');

  await del.delay();
  expect(spy).toHaveBeenLastCalledWith(expect.any(Function), 1);

  del.selectDelay(2);
  await del.delay();
  expect(spy).toHaveBeenLastCalledWith(expect.any(Function), 2);

  del.selectDelay(2);
  await del.delay();
  expect(spy).toHaveBeenLastCalledWith(expect.any(Function), 2);

  const spyWarn = jest.spyOn(console, 'warn');
  spyWarn.mockImplementation(() => {});
  // selecting non-existent delay selects the first one
  del.selectDelay(3);
  await del.delay();
  expect(spy).toHaveBeenLastCalledWith(expect.any(Function), 1);
  expect(spyWarn).toHaveBeenCalled();
  spyWarn.mockRestore();

  // check that selecting still works
  del.selectDelay(2);
  await del.delay();
  expect(spy).toHaveBeenLastCalledWith(expect.any(Function), 2);

  del.selectDelay(1);
  await del.delay();
  expect(spy).toHaveBeenLastCalledWith(expect.any(Function), 1);

  spy.mockRestore();
});

describe('bursting', () => {
  let del;
  let spyCanBurstNow;

  beforeEach(() => {
    jest.useFakeTimers('modern');
    del = new Delays([0]);
    spyCanBurstNow = jest.spyOn(del, 'canBurstNow');
  });

  afterEach(() => {
    spyCanBurstNow.mockRestore();
  });

  test('quick short burst (10 waits)', async () => {
    // we should be able to run 10 times in under 2ms
    for (let i = 0; i < 10; i += 1) {
      await del.delay();
      expect(spyCanBurstNow).toHaveLastReturnedWith(true);
    }
  });

  test('6*1ms runs', async () => {
    // spinning 6*1ms with delays should include at least one
    // first two spins will allow bursting
    await del.delay();
    expect(spyCanBurstNow).toHaveLastReturnedWith(true);
    for (let i = 0; i < FAST_BURSTS_MS; i += 1) {
      spin(1);
      await del.delay();
      expect(spyCanBurstNow).toHaveLastReturnedWith(true);
    }

    // next 1ms spin should finish the burst
    spin(1);

    await awaitDelay(del);

    expect(spyCanBurstNow).toHaveLastReturnedWith(false);
  });

  test('burst always after 10ms spin', async () => {
    await del.delay(); // this should burst as it's the first delay on this instance of Delays
    expect(spyCanBurstNow).toHaveLastReturnedWith(true);

    spin(10);
    await awaitDelay(del); // should not burst, we need to fake the timers
    expect(spyCanBurstNow).toHaveLastReturnedWith(false);

    spin(10);
    await del.delay(); // should burst again
    expect(spyCanBurstNow).toHaveLastReturnedWith(true);
  });
});

function spin(ms) {
  jest.advanceTimersByTime(ms);
}

function awaitDelay(del) {
  const delayPromise = del.delay();
  jest.runAllTimers(); // simulate timeouts during await
  return delayPromise;
}
