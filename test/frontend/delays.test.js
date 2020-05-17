import delays, { Delays } from '../../frontend/tools/delays.js';

test('default delays', () => {
  expect(delays).toBeDefined();
  expect(delays._delays).toStrictEqual([0, 100, 1000]);
});

test('10 and 100ms', async () => {
  const del = new Delays([10, 100]);
  const spy = jest.spyOn(window, 'setTimeout');

  await del.delay();
  expect(spy).toHaveBeenLastCalledWith(expect.any(Function), 10);

  del.selectNextDelay();
  await del.delay();
  expect(spy).toHaveBeenLastCalledWith(expect.any(Function), 100);

  del.selectNextDelay();
  await del.delay();
  expect(spy).toHaveBeenLastCalledWith(expect.any(Function), 10);

  spy.mockRestore();
});

test('selectDelay()', async () => {
  const del = new Delays([10, 20]);
  const spy = jest.spyOn(window, 'setTimeout');

  await del.delay();
  expect(spy).toHaveBeenLastCalledWith(expect.any(Function), 10);

  del.selectDelay(20);
  await del.delay();
  expect(spy).toHaveBeenLastCalledWith(expect.any(Function), 20);

  del.selectDelay(20);
  await del.delay();
  expect(spy).toHaveBeenLastCalledWith(expect.any(Function), 20);

  const spyWarn = jest.spyOn(console, 'warn');
  spyWarn.mockImplementation(() => {});
  // selecting non-existent delay selects the first one
  del.selectDelay(30);
  await del.delay();
  expect(spy).toHaveBeenLastCalledWith(expect.any(Function), 10);
  expect(spyWarn).toHaveBeenCalled();
  spyWarn.mockRestore();

  // check that selecting still works
  del.selectDelay(20);
  await del.delay();
  expect(spy).toHaveBeenLastCalledWith(expect.any(Function), 20);

  del.selectDelay(10);
  await del.delay();
  expect(spy).toHaveBeenLastCalledWith(expect.any(Function), 10);

  spy.mockRestore();
});

describe('bursting', () => {
  let del;
  let spySetTimeout;
  let spyCanBurstNow;

  beforeEach(() => {
    del = new Delays([0]);
    spySetTimeout = jest.spyOn(window, 'setTimeout');
    spyCanBurstNow = jest.spyOn(del, 'canBurstNow');
  });

  afterEach(() => {
    spySetTimeout.mockRestore();
    spyCanBurstNow.mockRestore();
  });

  test('quick short burst (10 waits)', async () => {
    // we should be able to run 10 times in under 2ms
    for (let i = 0; i < 10; i += 1) {
      await del.delay();
      expect(spyCanBurstNow).toHaveLastReturnedWith(true);
    }
  });

  test('10*1ms runs', async () => {
    // spinning 10*1ms without wait should take about 10ms (sanity check)
    const time0 = Date.now();
    for (let i = 0; i < 10; i += 1) {
      spin(1);
    }

    const time1 = Date.now();
    expect(time1 - time0).toBeGreaterThanOrEqual(10);

    // spinning 6*1ms but with delays should include at least one
    // first two spins will allow bursting
    await del.delay();
    expect(spyCanBurstNow).toHaveReturnedWith(true);
    expect(spyCanBurstNow).not.toHaveReturnedWith(false);
    for (let i = 0; i < 2; i += 1) {
      spin(1);
      await del.delay();
      expect(spyCanBurstNow).not.toHaveReturnedWith(false);
    }

    // next four 1ms spins must at some point finish the burst
    for (let i = 0; i < 4; i += 1) {
      spin(1);
      await del.delay();
    }
    expect(spyCanBurstNow).toHaveReturnedWith(false);
  });

  test('burst always after 10ms spin', async () => {
    await del.delay(); // this should burst as it's the first delay on this instance of Delays
    expect(spyCanBurstNow).toHaveLastReturnedWith(true);

    spin(10);
    await del.delay(); // should not burst
    expect(spyCanBurstNow).toHaveLastReturnedWith(false);

    spin(10);
    await del.delay(); // should burst again
    expect(spyCanBurstNow).toHaveLastReturnedWith(true);
  });
});

function spin(ms) {
  const time = Date.now();
  while (Date.now() - time < ms) {}
}
