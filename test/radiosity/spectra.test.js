import Spectra from '../../radiosity/spectra.js';

test('constructor', () => {
  const s1 = new Spectra();
  expect(s1).toMatchObject({ r: 0, g: 0, b: 0 });

  const s2 = new Spectra(1, 2, 3);
  expect(s2).toMatchObject({ r: 1, g: 2, b: 3 });

  const s3 = new Spectra(s2);
  expect(s3).not.toBe(s2);
  expect(s3).toStrictEqual(s2);
  s2.r += 10;
  expect(s3).not.toStrictEqual(s2);
});

test('add()', () => {
  const s1 = new Spectra(12, 0, 5);
  const s2 = new Spectra(0, 23, 1);
  expect(s1.add(s2)).toStrictEqual(new Spectra(12, 23, 6));
});

test('reset()', () => {
  const s1 = new Spectra(1, 2, 3);
  expect(s1).toMatchObject({ r: 1, g: 2, b: 3 });

  s1.reset();
  expect(s1).toStrictEqual(new Spectra());
});

test('sub()', () => {
  const s1 = new Spectra(12, 0, 5);
  const s2 = new Spectra(0, 23, 1);
  expect(s1.sub(s2)).toStrictEqual(new Spectra(12, -23, 4));
});

test('maxColor()', () => {
  const s1 = new Spectra(12, 0, 5);
  expect(s1.maxColor).toBe(12);
});

test('scale()', () => {
  const s1 = new Spectra(12, 0, 5);
  expect(s1.scale(5)).toStrictEqual(new Spectra(60, 0, 25));
});
