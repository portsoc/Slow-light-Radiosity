import ToneRep from '../../radiosity/tonerep.js';
import Point3 from '../../radiosity/point3.js';
import Vertex3 from '../../radiosity/vertex3.js';
import Patch3 from '../../radiosity/patch3.js';
import Spectra from '../../radiosity/spectra.js';
import Instance from '../../radiosity/instance.js';
import Surface3 from '../../radiosity/surface3.js';
import Environment from '../../radiosity/environment.js';
import RadEqnSolve from '../../radiosity/radeqnsolve.js';
import Element3 from '../../radiosity/element3.js';

/*
 * ^ y
 * |
 * |       7 ----- 6 ----- 5
 * |       |   p   |   p   |
 * |       |   3   |   4   |
 * 9 ----- 8 ----- 3 ----- 4
 * |   p   |   p   |
 * |   1   |   2   |
 * 0 ----- 1 ----- 2  -> x
 */
test('shade()', () => {
  // ? Set up instances

  // Points
  const p0 = new Point3(0, 0, 0);
  const p1 = new Point3(1, 0, 0);
  const p2 = new Point3(2, 0, 0);
  const p3 = new Point3(2, 1, 0);
  const p4 = new Point3(3, 1, 0);
  const p5 = new Point3(3, 2, 0);
  const p6 = new Point3(2, 2, 0);
  const p7 = new Point3(1, 2, 0);
  const p8 = new Point3(1, 1, 0);
  const p9 = new Point3(0, 1, 0);

  // Patches
  const patch1 = new Patch3([
    new Vertex3(p0),
    new Vertex3(p1),
    new Vertex3(p8),
    new Vertex3(p9),
  ]);
  const patch2 = new Patch3([
    new Vertex3(p1),
    new Vertex3(p2),
    new Vertex3(p3),
    new Vertex3(p8),
  ]);
  const patch3 = new Patch3([
    new Vertex3(p8),
    new Vertex3(p3),
    new Vertex3(p6),
    new Vertex3(p7),
  ]);
  const patch4 = new Patch3([
    new Vertex3(p3),
    new Vertex3(p4),
    new Vertex3(p5),
    new Vertex3(p6),
  ]);

  // Surfaces
  const surface1 = new Surface3(
    new Spectra(0.1, 0.2, 0.3),
    new Spectra(0.4, 0.5, 0.6),
    [patch1, patch2],
  );
  const surface2 = new Surface3(
    new Spectra(0.0, 1.0, 0.5),
    new Spectra(0.9, 0.2, 0.7),
    [patch3, patch4],
  );

  // Instances
  const instance1 = new Instance([surface1]);
  const instance2 = new Instance([surface2]);

  // ? Test

  const t = new ToneRep();
  t.shade([instance1, instance2]);

  // Check vertices exitance
  for (const vertex of instance1.vertices) {
    expect(vertex.exitance).toStrictEqual(surface1.reflectance);
  }
  for (const vertex of instance2.vertices) {
    expect(vertex.exitance).toStrictEqual(surface2.reflectance);
  }
});

/*
 * ^ y
 * |
 * |       7 ----- 6 ----- 5
 * |       |   p   |   p   |
 * |       |   3   |   4   |
 * 9 ----- 8 ----- 3 ----- 4
 * |   p   |   p   |
 * |   1   |   2   |
 * 0 ----- 1 ----- 2  -> x
 */
test.skip('interpolate()', () => {
  // ? Set up instances

  // Points
  const p0 = new Point3(0, 0, 0);
  const p1 = new Point3(1, 0, 0);
  const p2 = new Point3(2, 0, 0);
  const p3 = new Point3(2, 1, 0);
  const p4 = new Point3(3, 1, 0);
  const p5 = new Point3(3, 2, 0);
  const p6 = new Point3(2, 2, 0);
  const p7 = new Point3(1, 2, 0);
  const p8 = new Point3(1, 1, 0);
  const p9 = new Point3(0, 1, 0);

  // Elements
  const elem1 = new Element3([
    new Vertex3(p0),
    new Vertex3(p1),
    new Vertex3(p8),
    new Vertex3(p9),
  ]);
  const elem2 = new Element3([
    new Vertex3(p1),
    new Vertex3(p2),
    new Vertex3(p3),
    new Vertex3(p8),
  ]);
  const elem3 = new Element3([
    new Vertex3(p8),
    new Vertex3(p3),
    new Vertex3(p6),
    new Vertex3(p7),
  ]);
  const elem4 = new Element3([
    new Vertex3(p3),
    new Vertex3(p4),
    new Vertex3(p5),
    new Vertex3(p6),
  ]);

  elem1.exitance = new Spectra(0.1, 0.2, 0.3);
  elem2.exitance = new Spectra(0.4, 0.5, 0.6);
  elem3.exitance = new Spectra(0.7, 0.8, 0.9);
  elem4.exitance = new Spectra(1.0, 0.0, 1.0);

  // Patches
  const patch1 = new Patch3(
    [
      new Vertex3(p0),
      new Vertex3(p1),
      new Vertex3(p8),
      new Vertex3(p9),
    ],
    [elem1],
  );
  const patch2 = new Patch3(
    [
      new Vertex3(p1),
      new Vertex3(p2),
      new Vertex3(p3),
      new Vertex3(p8),
    ],
    [elem2],
  );
  const patch3 = new Patch3(
    [
      new Vertex3(p8),
      new Vertex3(p3),
      new Vertex3(p6),
      new Vertex3(p7),
    ],
    [elem3],
  );
  const patch4 = new Patch3(
    [
      new Vertex3(p3),
      new Vertex3(p4),
      new Vertex3(p5),
      new Vertex3(p6),
    ],
    [elem4],
  );

  // Surfaces
  const surface1 = new Surface3(
    new Spectra(0.1, 0.2, 0.3),
    new Spectra(0.4, 0.5, 0.6),
    [patch1, patch2],
  );
  const surface2 = new Surface3(
    new Spectra(0.0, 1.0, 0.5),
    new Spectra(0.9, 0.2, 0.7),
    [patch3, patch4],
  );

  // Instances
  const instance1 = new Instance([surface1]);
  const instance2 = new Instance([surface2]);

  // ? Set up RadEqnSolve

  // Environment
  const env = new Environment([instance1, instance2]);

  const r = new RadEqnSolve();
  r.env = env;
  r.initExitance();

  // ? Test

  const t = new ToneRep();
  t.interpolate(r.env.instances);

  // Check vertices exitance
});

/*
 * ^ y
 * |
 * |       7 ----- 6 ----- 5
 * |       |   p   |   p   |
 * |       |   3   |   4   |
 * 9 ----- 8 ----- 3 ----- 4
 * |   p   |   p   |
 * |   1   |   2   |
 * 0 ----- 1 ----- 2  -> x
 */
test.skip('normalize()', () => {
  // ? Set up instances (case with rMax)

  // Points
  const p0 = new Point3(0, 0, 0);
  const p1 = new Point3(1, 0, 0);
  const p2 = new Point3(2, 0, 0);
  const p3 = new Point3(2, 1, 0);
  const p4 = new Point3(3, 1, 0);
  const p5 = new Point3(3, 2, 0);
  const p6 = new Point3(2, 2, 0);
  const p7 = new Point3(1, 2, 0);
  const p8 = new Point3(1, 1, 0);
  const p9 = new Point3(0, 1, 0);

  // Patches
  const patch1 = new Patch3([
    new Vertex3(p0),
    new Vertex3(p1),
    new Vertex3(p8),
    new Vertex3(p9),
  ]);
  const patch2 = new Patch3([
    new Vertex3(p1),
    new Vertex3(p2),
    new Vertex3(p3),
    new Vertex3(p8),
  ]);
  const patch3 = new Patch3([
    new Vertex3(p8),
    new Vertex3(p3),
    new Vertex3(p6),
    new Vertex3(p7),
  ]);
  const patch4 = new Patch3([
    new Vertex3(p3),
    new Vertex3(p4),
    new Vertex3(p5),
    new Vertex3(p6),
  ]);

  // Surfaces
  const surface1 = new Surface3(
    new Spectra(0.1, 0.2, 0.3),
    new Spectra(0.1, 0.2, 0.3),
    [patch1, patch2],
  );
  const surface2 = new Surface3(
    new Spectra(0.0, 1.0, 0.5),
    new Spectra(0.9, 0.2, 0.7),
    [patch3, patch4],
  );

  // Instances
  const instance1 = new Instance([surface1]);
  const instance2 = new Instance([surface2]);

  // ? Test

  const t = new ToneRep();
  t.normalize([instance1, instance2]);

  // Check vertices exitance
  for (const instance of [instance1, instance2]) {
    for (const vertex of instance.vertices) {
      expect(vertex.exitance).toStrictEqual(new Spectra(0, 0, 0));
    }
  }
});
