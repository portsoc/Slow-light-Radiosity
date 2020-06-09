import * as Rad from '../../radiosity/index.js';
import * as subdivision from '../../modeling/subdivision.js';

test('quadElements 0 and 1', () => {
  const points = [
    new Rad.Point3(0, 0, 0),
    new Rad.Point3(12, 0, 1),
    new Rad.Point3(12, 12, 2),
    new Rad.Point3(0, 12, 1),
  ];
  const vertices = points.map(p => new Rad.Vertex3(p));

  const elements0 = subdivision.quadElements(vertices, 0);
  expect(elements0).toHaveLength(1);
  expect(elements0[0].vertices).toStrictEqual(vertices);

  const elements1 = subdivision.quadElements(vertices, 1);
  expect(elements1).toHaveLength(1);
  expect(elements1[0].vertices).toStrictEqual(vertices);

  const elements1b = subdivision.quadElements(vertices);
  expect(elements1b).toHaveLength(1);
  expect(elements1b[0].vertices).toStrictEqual(vertices);
});

test.each([2, 3, 4])('quadElements of %d squared', (n) => {
  const points = [
    new Rad.Point3(0, 0, 2),
    new Rad.Point3(12, 0, 2),
    new Rad.Point3(12, 12, 2),
    new Rad.Point3(0, 12, 2),
  ];
  const vertices = points.map(p => new Rad.Vertex3(p));

  const elements = subdivision.quadElements(vertices, n);
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

  const sub1 = subdivision.quadElements(vertices, 3);
  const sub1vertices = sub1.flatMap(el => el.vertices);
  const sub2 = subdivision.quadElements(vertices, 2);
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

  const sub3 = subdivision.quadElements(vertices, 3);
  const sub3vertices = sub3.flatMap(el => el.vertices);

  // check sub3 uses all the same vertices as sub1 - same n=3
  expect(sub3vertices.every(v => sub1vertices.includes(v))).toBe(true);
  expect(sub1vertices.every(v => sub3vertices.includes(v))).toBe(true);

  const sub4 = subdivision.quadElements(vertices, 2);
  const sub4vertices = sub4.flatMap(el => el.vertices);

  // check sub4 uses all the same vertices as sub2 - same n=2
  expect(sub4vertices.every(v => sub2vertices.includes(v))).toBe(true);
  expect(sub2vertices.every(v => sub4vertices.includes(v))).toBe(true);
});

describe('quadElements normals', () => {
  test('with planar coordinates', () => {
    const points = [
      new Rad.Point3(0, 0, 0),
      new Rad.Point3(12, 0, 1),
      new Rad.Point3(12, 12, 2),
      new Rad.Point3(0, 12, 1),
    ];
    const vertices = points.map(p => new Rad.Vertex3(p));

    const elements = subdivision.quadElements(vertices, 3);
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

    const elements = subdivision.quadElements(vertices, 3);
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

test.todo('quadElements with different x and y subdivisions');

test.todo('quadPatches');

describe('triangles', () => {
  test('len', () => {
    const len = subdivision._testing.len;

    const v0 = new Rad.Vertex3(new Rad.Point3(0, 0, 0));
    const v1 = new Rad.Vertex3(new Rad.Point3(3, 0, 0));
    const v2 = new Rad.Vertex3(new Rad.Point3(0, 4, 0));
    const v3 = new Rad.Vertex3(new Rad.Point3(0, 0, 4));

    expect(len(v0, v1)).toBeCloseTo(3, 5);
    expect(len(v1, v0)).toBeCloseTo(3, 5);
    expect(len(v0, v2)).toBeCloseTo(4, 5);
    expect(len(v1, v2)).toBeCloseTo(5, 5);
    expect(len(v1, v3)).toBeCloseTo(5, 5);
    expect(len(v3, v1)).toBeCloseTo(5, 5);
  });

  test('getAngle', () => {
    const getAngle = subdivision._testing.getAngle;

    const v0 = new Rad.Vector3(3, 3, 0);
    const v1 = new Rad.Vector3(3, 0, 0);
    const v2 = new Rad.Vector3(0, 3, 0);

    expect(getAngle(v0, v1)).toBeCloseTo(Math.PI / 4, 5);
    expect(getAngle(v0, v2)).toBeCloseTo(Math.PI / 4, 5);
    expect(getAngle(v1, v2)).toBeCloseTo(Math.PI / 2, 5);
  });

  test('getAngles', () => {
    const getAngles = subdivision._testing.getAngles;

    const v0 = new Rad.Vertex3(new Rad.Point3(0, 0, 0));
    const v1 = new Rad.Vertex3(new Rad.Point3(3, 0, 0));
    const v2 = new Rad.Vertex3(new Rad.Point3(0, 4, 0));

    const angles = getAngles([v0, v1, v2]);
    expect(angles[0]).toBeCloseTo(Math.PI / 2, 5);
    expect(angles[1]).toBeCloseTo(Math.acos(3 / 5), 5);
    expect(angles[2]).toBeCloseTo(Math.acos(4 / 5), 5);
  });

  test('findMaxIndex3', () => {
    const findMaxIndex3 = subdivision._testing.findMaxIndex3;
    expect(findMaxIndex3([0, 1, 2])).toBe(2);
    expect(findMaxIndex3([1, 2, 3])).toBe(2);
    expect(findMaxIndex3([4, 2, 3])).toBe(0);
    expect(findMaxIndex3([4, 2, 3, 6])).toBe(0); // ignores more than 3 elements
    expect(findMaxIndex3([4, 6, 3])).toBe(1);
    expect(findMaxIndex3([0, 0, 0])).toBe(2);
  });
});
