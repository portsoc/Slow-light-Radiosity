import Vertex3 from '../../radiosity/vertex3.js';
import Element3 from '../../radiosity/element3.js';
import Point3 from '../../radiosity/point3.js';
import Vector3 from '../../radiosity/vector3.js';

// ^ y
// |
// 6 ----- 7 ----- 8
// |   e   |   e   |
// |   2   |   3   |
// 3 ----- 4 ----- 5
// |   e   |   e   |
// |   0   |   1   |
// 0 ----- 1 ----- 2  -> x

test('addElement', () => {
  const p1 = [
    new Point3(0, 0, 0),
    new Point3(1, 0, 0),
    new Point3(1, 1, 0),
    new Point3(0, 1, 0),
  ];
  const v1 = p1.map(p => new Vertex3(p));
  const e1 = new Element3(v1);

  expect(v1[0].elements).toEqual([e1]);

  v1[0].addElement(e1); // addElement shouldn't add an element twice
  expect(v1[0].elements).toEqual([e1]);

  const e2 = new Element3(v1);
  expect(v1[0].elements).toEqual([e1, e2]);
});

test('normal()', () => {
  // four elements in the XY plane
  const points1 = [
    new Point3(0, 0, 0),
    new Point3(1, 0, 0),
    new Point3(2, 0, 0),
    new Point3(0, 1, 0),
    new Point3(1, 1, 0),
    new Point3(2, 1, 0),
    new Point3(0, 2, 0),
    new Point3(1, 2, 0),
    new Point3(2, 2, 0),
  ];
  const v1 = createTestElements(points1).vertices;
  const n1 = v1[4].normal;

  // test normal in the central vertex
  expect(n1).toBeInstanceOf(Vector3);
  expect(n1).toBe(v1[4].normal); // the normal should be computed once
  expect(n1).toEqual(new Vector3(0, 0, 1));

  // in the following elements, the centre point is raised
  const points2 = [
    new Point3(0, 0, 0),
    new Point3(1, 0, 0.5),
    new Point3(2, 0, 0),
    new Point3(0, 1, 0.5),
    new Point3(1, 1, 1),
    new Point3(2, 1, 0.5),
    new Point3(0, 2, 0),
    new Point3(1, 2, 0.5),
    new Point3(2, 2, 0),
  ];

  const v2 = createTestElements(points2).vertices;
  const n2 = v2[1].normal;

  // test normal in the central vertex
  expect(v2[4].normal).toEqual(new Vector3(0, 0, 1));

  expect(n2.x).toBeCloseTo(0, 5);
  expect(n2.y).toBeCloseTo(-0.4472135955, 5);
  expect(n2.z).toBeCloseTo(0.894427191, 5);

  // these are in a plane going through Y, and at 45° between X and Z
  const points3 = [
    new Point3(0, 0, 0),
    new Point3(1, 0, 1),
    new Point3(2, 0, 2),
    new Point3(0, 1, 0),
    new Point3(1, 1, 1),
    new Point3(2, 1, 2),
    new Point3(0, 2, 0),
    new Point3(1, 2, 1),
    new Point3(2, 2, 2),
  ];

  const v3 = createTestElements(points3).vertices;
  const n3 = v3[4].normal;

  // test normal in the central vertex, approximately to 5 places
  expect(n3.x).toBeCloseTo(-Math.sqrt(0.5), 5);
  expect(n3.y).toBe(0);
  expect(n3.z).toBeCloseTo(Math.sqrt(0.5), 5);
});


/*
 * Creates four elements from an array of 9 points like this:
 *
 * ^ y
 * |
 * 6 ----- 7 ----- 8
 * |   e   |   e   |
 * |   2   |   3   |
 * 3 ----- 4 ----- 5
 * |   e   |   e   |
 * |   0   |   1   |
 * 0 ----- 1 ----- 2  -> x
 *
 * Returns { vertices, elements } so all objects can be tested.
 */

function createTestElements(ninePoints) {
  const vertices = ninePoints.map(p => new Vertex3(p));

  const elements = [
    new Element3(
      [
        vertices[0],
        vertices[1],
        vertices[4],
        vertices[3],
      ],
      null),
    new Element3(
      [
        vertices[1],
        vertices[2],
        vertices[5],
        vertices[4],
      ],
      null),
    new Element3(
      [
        vertices[3],
        vertices[4],
        vertices[7],
        vertices[6],
      ],
      null),
    new Element3(
      [
        vertices[4],
        vertices[5],
        vertices[8],
        vertices[7],
      ],
      null),
  ];

  return { vertices, elements };
}
