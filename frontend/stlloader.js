import { STLLoader } from '../lib/STLLoader.js';
import { Point3, Patch3, Surface3, Spectra, Instance, Vertex3 } from '../radiosity/index.js';

console.log(loadSTL('../modeling/stl-models/cube.stl', [214, 48, 49]));

export function loadSTL(filepath, colorRGB) {
  let inst;

  // Load STL file
  const loader = new STLLoader();
  loader.load(
    filepath,
    (geometry) => {
      inst = STLToInstance(geometry, colorRGB);
    },
  );

  return inst;
}

function STLToInstance(g, c) {
  // Vertices
  const vertices = [];
  const posArray = g.attributes.position.array;
  for (let i = 0; i < posArray.length; i += 3) {
    vertices.push(
      new Vertex3(
        new Point3(
          posArray[i],
          posArray[i + 1],
          posArray[i + 2],
        ),
      ),
    );
  }

  // Patches
  const patches = [];
  for (let i = 0; i < vertices.length; i += 3) {
    patches.push(
      new Patch3(
        [
          vertices[i],
          vertices[i + 1],
          vertices[i + 2],
        ],
      ),
    );
  }

  // Surfaces
  const surfaces = [
    new Surface3(
      new Spectra(
        c[0], c[1], c[2],
      ),
      null,
      patches,
    ),
  ];

  // Instance
  return new Instance(surfaces);
}
