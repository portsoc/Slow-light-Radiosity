import Environment from '../../radiosity/environment.js';
import Instance from '../../radiosity/instance.js';
import Surface3 from '../../radiosity/surface3.js';
import Point3 from '../../radiosity/point3.js';
import Patch3 from '../../radiosity/patch3.js';
import Vertex3 from '../../radiosity/vertex3.js';

test('constructor', () => {
  const s1 = new Surface3(null, null, []);
  const i1 = new Instance([s1]);
  const e1 = new Environment([i1]);
  expect(e1.instances).toEqual([i1]);
});

test('checkNoVerticesAreShared', () => {
  const points = [
    new Point3(0, 0, 0),
    new Point3(1, 0, 0),
    new Point3(1, 1, 0),
    new Point3(0, 1, 0),
  ];
  const vertices = points.map(p => new Vertex3(p));
  const p1 = new Patch3(vertices);
  const s1 = new Surface3(null, null, [p1]);
  const i1 = new Instance([s1]);
  const e1 = new Environment([i1]);
  expect(e1.checkNoVerticesAreShared()).toBe(true);

  const points2 = [
    new Point3(0, 0, 0),
    new Point3(1, 0, 0),
    new Point3(1, 1, 0),
    new Point3(0, 1, 0),
  ];
  const vertices2 = points2.map(p => new Vertex3(p));

  const p2 = new Patch3(vertices2);
  const s2 = new Surface3(null, null, [p2]);
  const i2 = new Instance([s2]);
  const e2 = new Environment([i1, i2]);
  expect(e2.checkNoVerticesAreShared()).toBe(true);

  const p3 = new Patch3(vertices);
  const s3 = new Surface3(null, null, [p3]);
  const i3 = new Instance([s3]);
  const e3 = new Environment([i1, i3]);
  expect(e3.checkNoVerticesAreShared()).toBe(false);
});

describe('with a non-trivial environment', () => {
  let environment;

  beforeEach(() => {
    const points = [
      new Point3(0, 0, 0),
      new Point3(1, 0, 0),
      new Point3(1, 1, 0),
      new Point3(0, 1, 0),
    ];
    const v1 = points.map(p => new Vertex3(p));
    const p1a = new Patch3(v1);
    const p1b = new Patch3(v1);
    const s1 = new Surface3(null, null, [p1a, p1b]);
    const i1 = new Instance([s1]);

    const points2 = [
      new Point3(0, 0, 0),
      new Point3(1, 0, 0),
      new Point3(1, 1, 0),
    ];
    const p2a = new Patch3(points2.map(p => new Vertex3(p)));
    const p2b = new Patch3(points2.map(p => new Vertex3(p)));
    const p2c = new Patch3(points2.map(p => new Vertex3(p)));
    const s2a = new Surface3(null, null, [p2a]);
    const s2bc = new Surface3(null, null, [p2b, p2c]);
    const i2 = new Instance([s2a, s2bc]);
    environment = new Environment([i1, i2]);
  });

  test('get numSurf', () => {
    expect(environment.numSurf).toBe(3);
  });

  test('get numPatch', () => {
    expect(environment.numPatch).toBe(5);
  });

  test('get numElem', () => {
    expect(environment.numElem).toBe(5);
  });

  test('get numVert', () => {
    expect(environment.numVert).toBe(13);
  });
});
