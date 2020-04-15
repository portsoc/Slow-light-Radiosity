import * as Rad from '../../radiosity/index.js';
import * as subdivision from '../../modeling/subdivision.js';

test('quad 0 and 1', () => {
  const points = [
    new Rad.Point3(0, 0, 0),
    new Rad.Point3(12, 0, 1),
    new Rad.Point3(12, 12, 2),
    new Rad.Point3(0, 12, 1),
  ];
  const vertices = points.map(p => new Rad.Vertex3(p));

  const elements0 = subdivision.quad(vertices, 0);
  expect(elements0).toHaveLength(1);
  expect(elements0[0].vertices).toStrictEqual(vertices);

  const elements1 = subdivision.quad(vertices, 1);
  expect(elements1).toHaveLength(1);
  expect(elements1[0].vertices).toStrictEqual(vertices);

  const elements1b = subdivision.quad(vertices);
  expect(elements1b).toHaveLength(1);
  expect(elements1b[0].vertices).toStrictEqual(vertices);
});

test.each([2, 3, 4])('quad of %d squared', (n) => {
  const points = [
    new Rad.Point3(0, 0, 2),
    new Rad.Point3(12, 0, 2),
    new Rad.Point3(12, 12, 2),
    new Rad.Point3(0, 12, 2),
  ];
  const vertices = points.map(p => new Rad.Vertex3(p));

  const elements = subdivision.quad(vertices, n);
  expect(elements).toHaveLength(n * n);

  const patch = new Rad.Patch3(vertices, elements);
  expect(patch.area).toBe(144);

  const normal = new Rad.Vector3(0, 0, 1);

  for (const el of elements) {
    expect(el.area).toBe(144 / n / n);
    expect(el.normal).toStrictEqual(normal);
  }
});

describe('quad normals', () => {
  test('with planar coordinates', () => {
    const points = [
      new Rad.Point3(0, 0, 0),
      new Rad.Point3(12, 0, 1),
      new Rad.Point3(12, 12, 2),
      new Rad.Point3(0, 12, 1),
    ];
    const vertices = points.map(p => new Rad.Vertex3(p));

    const elements = subdivision.quad(vertices, 3);
    expect(elements).toHaveLength(9);
    const normal0 = elements[0].normal;
    for (const el of elements) {
      const normal = el.normal;
      expect(normal.x).toBeCloseTo(normal0.x, 5);
      expect(normal.y).toBeCloseTo(normal0.y, 5);
      expect(normal.z).toBeCloseTo(normal0.z, 5);
    }
    expect(allSimilarNormals(elements)).toBe(true);
  });

  test('with non-planar coordinates', () => {
    // with non-planar coordinates, the generated patches will not be in a plane
    // so their normals (computed only usign three vertices) won't all match
    const points = [
      new Rad.Point3(0, 0, 0),
      new Rad.Point3(12, 0, 1),
      new Rad.Point3(12, 12, 2),
      new Rad.Point3(0, 12, 10), // this is much higher than it should be
    ];
    const vertices = points.map(p => new Rad.Vertex3(p));

    const elements = subdivision.quad(vertices, 3);
    expect(elements).toHaveLength(9);
    expect(allSimilarNormals(elements)).toBe(false);
  });
});

// adopted from jest's toBeCloseTo with numDigits=5
function numbersClose(a, b) {
  return Math.abs(a - b) < (10 ** -5 / 2);
}

// check that all the normals of the given elements are similar
function allSimilarNormals(elements) {
  const normal0 = elements[0].normal;

  const retval = elements.every(el => {
    return numbersClose(el.normal.x, normal0.x) &&
      numbersClose(el.normal.y, normal0.y) &&
      numbersClose(el.normal.z, normal0.z);
  });
  return retval;
}
