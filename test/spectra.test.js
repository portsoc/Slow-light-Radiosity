import Spectra from '../radiosity/spectra.js';

test('add()', () => {
  const s1 = new Spectra(12, 0, 5);
  const s2 = new Spectra(0, 23, 1);
  expect(s1.add(s2)).toEqual(new Spectra(12, 23, 6));
});

test('sub()', () => {
  const s1 = new Spectra(12, 0, 5);
  const s2 = new Spectra(0, 23, 1);
  expect(s1.sub(s2)).toEqual(new Spectra(12, -23, 4));
});

test('maxColor()', () => {
  const s1 = new Spectra(12, 0, 5);
  expect(s1.maxColor).toBe(12);
});

test('scale()', () => {
  const s1 = new Spectra(12, 0, 5);
  expect(s1.scale(5)).toEqual(new Spectra(60, 0, 25));
});
