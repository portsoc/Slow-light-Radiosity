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

  const allCoordinates = [];
  for (let x = 0; x <= n; x += 1) {
    for (let y = 0; y <= n; y += 1) {
      allCoordinates.push({ x: x * 12 / n, y: y * 12 / n, z: 2 });
    }
  }

  for (const el of elements) {
    expect(el.area).toBe(144 / n / n);
    expect(el.normal).toStrictEqual(normal);
    expect(el.vertices).toHaveLength(4);

    // check that all the vertices of the element are among the expect ones
    const points = el.vertices.map(v => v.pos);
    expect(allCoordinates).toEqual(expect.arrayContaining(points));
  }
});

test('subdivision caching', () => {
  const points = [
    new Rad.Point3(0, 0, 2),
    new Rad.Point3(12, 0, 2),
    new Rad.Point3(12, 12, 2),
    new Rad.Point3(0, 12, 2),
  ];
  const vertices = points.map(p => new Rad.Vertex3(p));

  const sub1 = subdivision.quad(vertices, 3);
  const sub1vertices = sub1.flatMap(el => el.vertices);
  const sub2 = subdivision.quad(vertices, 2);
  const sub2vertices = sub2.flatMap(el => el.vertices);

  // check the two subdivisions don't share vertices except the ones in the corners
  for (const sub1v of sub1vertices) {
    if (!vertices.includes(sub1v)) {
      expect(sub2vertices).not.toContain(sub1v);
    }
  }
  for (const sub2v of sub2vertices) {
    if (!vertices.includes(sub2v)) {
      expect(sub1vertices).not.toContain(sub2v);
    }
  }

  const sub3 = subdivision.quad(vertices, 3);
  const sub3vertices = sub3.flatMap(el => el.vertices);

  // check sub3 uses all the same vertices as sub1 - same n=3
  expect(sub3vertices.every(v => sub1vertices.includes(v))).toBe(true);
  expect(sub1vertices.every(v => sub3vertices.includes(v))).toBe(true);

  const sub4 = subdivision.quad(vertices, 2);
  const sub4vertices = sub4.flatMap(el => el.vertices);

  // check sub4 uses all the same vertices as sub2 - same n=2
  expect(sub4vertices.every(v => sub2vertices.includes(v))).toBe(true);
  expect(sub2vertices.every(v => sub4vertices.includes(v))).toBe(true);
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
