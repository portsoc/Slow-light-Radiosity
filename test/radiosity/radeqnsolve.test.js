import RadEqnSolve from '../../radiosity/radeqnsolve.js';
import Spectra from '../../radiosity/spectra.js';
import Patch3 from '../../radiosity/patch3.js';
import Vertex3 from '../../radiosity/vertex3.js';
import Point3 from '../../radiosity/point3.js';
import Surface3 from '../../radiosity/surface3.js';
import Instance from '../../radiosity/instance.js';
import Environment from '../../radiosity/environment.js';

test('constructor', () => {
  const r = new RadEqnSolve();

  expect(r.totalArea).toBe(0);
  expect(r.totalFlux).toBe(0);
  expect(r.totalUnsent).toBe(0);
  expect(r.stepCount).toBe(0);
  expect(r.maxStep).toEqual(expect.any(Number));
  expect(r.stopCriterion).toEqual(expect.any(Number));
  expect(r.convergence).toBeNull();
  expect(r.max).toBeNull();
  expect(r.env).toBeNull();
  expect(r.ambient).toStrictEqual(new Spectra());
  expect(r.irf).toStrictEqual(new Spectra());
});

test('calculate()', () => {
  const r = new RadEqnSolve();

  expect(r.calculate).not.toBeDefined();
});

test('open()', () => {
  const r = new RadEqnSolve();

  expect(() => r.open(null)).toThrow(TypeError);
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
test('initExitance()', () => {
  // ? Set up the environment

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

  // Environment
  const env = new Environment([instance1, instance2]);

  // ? Test

  const r = new RadEqnSolve();
  r.env = env;

  expect(r.initExitance()).toBe(r);

  // Check patches, elements and vertices exitances
  for (const instance of r.env.instances) {
    for (const surface of instance.surfaces) {
      for (const patch of surface.patches) {
        expect(patch.exitance).toStrictEqual(patch.parentSurface.emittance);
        for (const element of patch.elements) {
          expect(element.exitance).toStrictEqual(patch.parentSurface.emittance);
          for (const vertex of patch.vertices) {
            expect(vertex.exitance).toStrictEqual(new Spectra(0, 0, 0));
          }
        }
      }
    }
  }
  // Check totalFlux
  expect(r.totalFlux).toBe(6.6);
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
test('updateUnsentStats()', () => {
  // ? Set up the environment

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

  // Environment
  const env = new Environment([instance1, instance2]);

  // ? Test

  const r = new RadEqnSolve(env);
  r.env = env;
  r.initExitance();

  expect(r.updateUnsentStats()).toBe(r);

  // Check totalUnsent
  expect(r.totalUnsent).toBe(6.6);
  // Check max
  expect(r.max).toStrictEqual(patch3);
  // Check convergence
  expect(r.convergence).toBe(1);
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
test('calcInterReflect()', () => {
  // ? Set up the environment

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

  // Environment
  const env = new Environment([instance1, instance2]);

  // ? Test

  const r = new RadEqnSolve();
  r.env = env;
  r.initExitance();

  expect(r.calcInterReflect()).toBe(r);

  // Check totalArea
  expect(r.totalArea).toBe(4);
  // Check irf
  expect(r.irf).toStrictEqual(new Spectra(1 / 0.95, 1 / 0.4, 1 / 0.6));
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
test.skip('calcAmbient()', () => {
  // ? Set up the environment

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

  // Environment
  const env = new Environment([instance1, instance2]);

  // ? Test

  const r = new RadEqnSolve(env);
  r.env = env;
  r.initExitance();
  r.calcInterReflect();

  expect(r.calcAmbient()).toBe(r);
  // Check ambient
  expect(r.ambient).toStrictEqual(new Spectra(r.irf.r * 0.05, r.irf.g * 0.6, r.irf.b * 0.4));
});
