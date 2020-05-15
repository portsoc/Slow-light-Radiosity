import SlowRad from '../../radiosity/slowrad.js';
import Point3 from '../../radiosity/point3.js';
import Patch3 from '../../radiosity/patch3.js';
import Vertex3 from '../../radiosity/vertex3.js';
import Surface3 from '../../radiosity/surface3.js';
import Spectra from '../../radiosity/spectra.js';
import Environment from '../../radiosity/environment.js';
import Instance from '../../radiosity/instance.js';

test('calcPatchElementDistances()', () => {
  // ? Setup the environment

  // Points
  const points = [
    // center (0, 0, 0)
    new Point3(-1, 1, 0),
    new Point3(-1, -1, 0),
    new Point3(1, -1, 0),
    new Point3(1, 1, 0),

    // center (0, 3, 0)
    new Point3(-1, 4, 0),
    new Point3(-1, 2, 0),
    new Point3(1, 2, 0),
    new Point3(1, 4, 0),

    // center (0, 3, 4)
    new Point3(-1, 4, 4),
    new Point3(-1, 2, 4),
    new Point3(1, 2, 4),
    new Point3(1, 4, 4),
  ];

  // Vertices
  const vertices = points.map(p => new Vertex3(p));

  // Patches
  const patches = [
    new Patch3(select(vertices, 0, 1, 2, 3)),
    new Patch3(select(vertices, 4, 5, 6, 7)),
    new Patch3(select(vertices, 8, 9, 10, 11)),
  ];

  // Surfaces
  const colour = new Spectra();
  const surfaces = [
    new Surface3(colour, colour, select(patches, 0, 1)),
    new Surface3(colour, colour, select(patches, 2)),
  ];

  // Environment
  const env = new Environment([new Instance(surfaces)]);

  // ? Test

  const rad = new SlowRad();
  rad.open(env);

  expect(rad.env.instances[0].surfaces[0].patches[0].distArray).toStrictEqual([3, 5]);
  expect(rad.env.instances[0].surfaces[0].patches[1].distArray).toStrictEqual([3, 4]);
  expect(rad.env.instances[0].surfaces[1].patches[0].distArray).toStrictEqual([5, 4]);
});

function select(arr, ...indices) {
  const retval = [];
  for (const i of indices) {
    retval.push(arr[i]);
  }
  return retval;
}
