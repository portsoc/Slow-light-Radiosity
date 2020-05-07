import Environment from '../../radiosity/environment.js';
import Instance from '../../radiosity/instance.js';
import Surface3 from '../../radiosity/surface3.js';
import Point3 from '../../radiosity/point3.js';
import Patch3 from '../../radiosity/patch3.js';
import Element3 from '../../radiosity/element3.js';
import Vertex3 from '../../radiosity/vertex3.js';

test('constructor', () => {
  const s1 = new Surface3(null, null, []);
  const i1 = new Instance([s1]);
  const e1 = new Environment([i1]);
  expect(e1.instances).toStrictEqual([i1]);
});

describe('checkNoVerticesAreShared', () => {
  test('no shared', () => {
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

    const vertices2 = points.map(p => new Vertex3(p));

    const p2 = new Patch3(vertices2);
    const s2 = new Surface3(null, null, [p2]);
    const i2 = new Instance([s2]);
    const e2 = new Environment([i1, i2]);
    expect(e2.checkNoVerticesAreShared()).toBe(true);
  });

  test('shared through patch', () => {
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

    // patch with vertices from another surface
    const p3 = new Patch3(vertices);
    const s3 = new Surface3(null, null, [p3]);
    const i3 = new Instance([s3]);
    const e3 = new Environment([i1, i3]);
    expect(e3.checkNoVerticesAreShared()).toBe(false);

    // the above has polluted i1 with vertices shared by surfaces
    const e4 = new Environment([i1]);
    expect(e4.checkNoVerticesAreShared()).toBe(false);
  });

  test('shared through element', () => {
    const points = [
      new Point3(0, 0, 0),
      new Point3(1, 0, 0),
      new Point3(1, 1, 0),
      new Point3(0, 1, 0),
    ];
    const verticesE = points.map(p => new Vertex3(p));
    const el1 = new Element3(verticesE);
    const verticesP = points.map(p => new Vertex3(p));
    const p1 = new Patch3(verticesP, [el1]);
    const s1 = new Surface3(null, null, [p1]);
    const i1 = new Instance([s1]);
    const e1 = new Environment([i1]);
    expect(e1.checkNoVerticesAreShared()).toBe(true);

    const vertices5 = points.map(p => new Vertex3(p));

    // element with vertices from another surface
    const el5 = new Element3(verticesE);

    // p5 has its own vertices5, but el5 has vertices shared with el1
    const p5 = new Patch3(vertices5, [el5]);
    const s5 = new Surface3(null, null, [p5]);
    const i5 = new Instance([s5]);
    const e5 = new Environment([i1, i5]);
    expect(e5.checkNoVerticesAreShared()).toBe(false);

    // the above has polluted i1 with vertices shared by surfaces
    const e6 = new Environment([i1]);
    expect(e6.checkNoVerticesAreShared()).toBe(false);
  });
});

describe('with a non-trivial environment', () => {
  let environment;

  beforeEach(() => {
    const points = [
      new Point3(-1, -1, 2),
      new Point3(1, 0, 2),
      new Point3(1, 1, 2),
      new Point3(0, 1, 2),
    ];
    const v1 = points.map(p => new Vertex3(p));
    const p1a = new Patch3(v1);
    const p1b = new Patch3(v1);
    const s1 = new Surface3(null, null, [p1a, p1b]);
    const i1 = new Instance([s1]);

    const points2 = [
      new Point3(0, 0, 4),
      new Point3(1, -4, 5),
      new Point3(1, 1, 4),
    ];
    const p2a = new Patch3(points2.map(p => new Vertex3(p)));
    const p2b = new Patch3(points2.map(p => new Vertex3(p)));
    const p2c = new Patch3(points2.map(p => new Vertex3(p)));
    const s2a = new Surface3(null, null, [p2a]);
    const s2bc = new Surface3(null, null, [p2b, p2c]);
    const i2 = new Instance([s2a, s2bc]);
    environment = new Environment([i1, i2]);
  });

  test('get surfaceCount', () => {
    expect(environment.surfaceCount).toBe(3);
  });

  test('get patchCount', () => {
    expect(environment.patchCount).toBe(5);
  });

  test('get elementCount', () => {
    expect(environment.elementCount).toBe(5);
  });

  test('get vertexCount', () => {
    expect(environment.vertexCount).toBe(13);
  });

  test('get boundingBox', () => {
    expect(environment.boundingBox).toStrictEqual(
      [new Point3(-1, -4, 2), new Point3(1, 1, 5)],
    );
  });
});

test.todo('interpolateVertexExitances()');
