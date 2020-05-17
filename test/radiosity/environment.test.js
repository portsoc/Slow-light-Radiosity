import Environment from '../../radiosity/environment.js';
import Instance from '../../radiosity/instance.js';
import Surface3 from '../../radiosity/surface3.js';
import Point3 from '../../radiosity/point3.js';
import Patch3 from '../../radiosity/patch3.js';
import Element3 from '../../radiosity/element3.js';
import Vertex3 from '../../radiosity/vertex3.js';
import Spectra from '../../radiosity/spectra.js';

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

  let points;
  let v1;
  let p1a;
  let p1b;
  let s1;
  let i1;
  let points2;
  let v2a;
  let v2b;
  let v2c;
  let p2a;
  let p2b;
  let p2c;
  let s2a;
  let s2bc;
  let i2;

  beforeAll(() => {
    points = [
      new Point3(-1, -1, 2),
      new Point3(1, 0, 2),
      new Point3(1, 1, 2),
      new Point3(0, 1, 2),
    ];
    v1 = points.map(p => new Vertex3(p));
    p1a = new Patch3(v1);
    p1b = new Patch3(v1);
    s1 = new Surface3(null, null, [p1a, p1b]);
    i1 = new Instance([s1]);

    points2 = [
      new Point3(0, 0, 4),
      new Point3(1, -4, 5),
      new Point3(1, 1, 4),
    ];
    v2a = points2.map(p => new Vertex3(p));
    v2b = points2.map(p => new Vertex3(p));
    v2c = points2.map(p => new Vertex3(p));
    p2a = new Patch3(v2a);
    p2b = new Patch3(v2b);
    p2c = new Patch3(v2c);
    s2a = new Surface3(null, null, [p2a]);
    s2bc = new Surface3(null, null, [p2b, p2c]);
    i2 = new Instance([s2a, s2bc]);

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

  test('get vertices', () => {
    expect(Array.from(environment.vertices)).toStrictEqual([...v1, ...v2a, ...v2b, ...v2c]);
    // run twice to make sure we don't just have a one-use iterator
    expect(Array.from(environment.vertices)).toStrictEqual([...v1, ...v2a, ...v2b, ...v2c]);
  });

  test('get elements', () => {
    expect(Array.from(environment.elements)).toStrictEqual(
      [p1a, p1b, p2a, p2b, p2c].flatMap(patch => patch.elements),
    );
    // run twice to make sure we don't just have a one-use iterator
    expect(Array.from(environment.elements)).toStrictEqual(
      [p1a, p1b, p2a, p2b, p2c].flatMap(patch => patch.elements),
    );
  });

  test('get patches', () => {
    expect(Array.from(environment.patches)).toStrictEqual([p1a, p1b, p2a, p2b, p2c]);
    // run twice to make sure we don't just have a one-use iterator
    expect(Array.from(environment.patches)).toStrictEqual([p1a, p1b, p2a, p2b, p2c]);
  });

  test('get surfaces', () => {
    expect(Array.from(environment.surfaces)).toStrictEqual([s1, s2a, s2bc]);
    // run twice to make sure we don't just have a one-use iterator
    expect(Array.from(environment.surfaces)).toStrictEqual([s1, s2a, s2bc]);
  });

  test('numberElements()', () => {
    let elementNumbers = Array.from(environment.elements).map(el => el.number);
    expect(elementNumbers).toStrictEqual([undefined, undefined, undefined, undefined, undefined]);

    expect(environment.numberElements()).toBe(5);

    elementNumbers = Array.from(environment.elements).map(el => el.number);
    expect(elementNumbers).toStrictEqual([0, 1, 2, 3, 4]);

    // cover the branch where elements are already numbered
    expect(environment.numberElements()).toBe(5);
  });
});

test('interpolateVertexExitances()', () => {
  /*
   *  1__
   *  |\ \_
   *  | \ B\_
   *  |A 2----3
   *  | / C_/
   *  |/ _/
   *  0_/
   */
  const points = [
    new Point3(0, 0, 0),
    new Point3(0, 2, 0),
    new Point3(1, 1, 0),
    new Point3(2, 1, 0),
  ];
  const v = points.map(p => new Vertex3(p));
  const elA = new Element3([v[0], v[2], v[1]]);
  const elB = new Element3([v[1], v[2], v[3]]);
  const elC = new Element3([v[0], v[3], v[2]]);
  const p = new Patch3([v[0], v[3], v[1]], [elA, elB, elC]);
  const s = new Surface3(null, null, [p]);
  const i = new Instance([s]);
  const e = new Environment([i]);

  elA.exitance.setTo(new Spectra(1, 2, 3));
  elB.exitance.setTo(new Spectra(2, 3, 4));
  elC.exitance.setTo(new Spectra(6, 4, 8));

  expect(v.map(vertex => vertex.exitance)).toStrictEqual([
    new Spectra(0, 0, 0),
    new Spectra(0, 0, 0),
    new Spectra(0, 0, 0),
    new Spectra(0, 0, 0),
  ]);

  e.interpolateVertexExitances();
  expect(v.map(vertex => vertex.exitance)).toStrictEqual([
    new Spectra(3.5, 3, 5.5),
    new Spectra(1.5, 2.5, 3.5),
    new Spectra(3, 3, 5),
    new Spectra(4, 3.5, 6),
  ]);
});
