import { FormEdgeInfo } from '../../radiosity/formscan.js';

test('reset()', () => {
  const fei = new FormEdgeInfo();
  expect(fei.start).toStrictEqual({ x: null, z: null });
  expect(fei.end).toStrictEqual({ x: null, z: null });

  const start = fei.start;
  const end = fei.end;

  // set up
  fei.start.x = 0;
  fei.start.z = -1;
  fei.end.x = 5;
  fei.end.z = 2;

  expect(fei.reset()).toBe(fei);
  expect(fei.start).toBe(start);
  expect(fei.start).toStrictEqual({ x: null, z: null });
  expect(fei.end).toBe(end);
  expect(fei.end).toStrictEqual({ x: null, z: null });
});

test('add()', () => {
  const fei = new FormEdgeInfo();
  const start = {
    x: 0,
    z: -1,
  };
  const end = {
    x: 5,
    z: 2,
  };
  const end2 = {
    x: -26,
    z: 8,
  };

  // set the start, the end is still null
  expect(fei.add(start.x, start.z)).toBe(fei);
  expect(fei.start).toStrictEqual(start);
  expect(fei.end).toStrictEqual({ x: null, z: null });

  // set the end, the start is unchanged
  expect(fei.add(end.x, end.z)).toBe(fei);
  expect(fei.start).toStrictEqual(start);
  expect(fei.end).toStrictEqual(end);

  // set the end again, the start is still unchanged
  expect(fei.add(end2.x, end2.z)).toBe(fei);
  expect(fei.start).toStrictEqual(start);
  expect(fei.end).toStrictEqual(end2);
});
