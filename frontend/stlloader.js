import { STLLoader } from '../lib/STLLoader.js';
import { Point3, Patch3, Surface3, Spectra, Instance, Vertex3 } from '../radiosity/index.js';

let geo;
const LOADER = new STLLoader();

export function loadSTL(filepath, colorRGB) {
  load(filepath)
    .then(() => {
      const inst = STLToInstance(geo, colorRGB);
      // ! DEBUG
      console.log(inst);

      return inst;
    });
}

function load(filepath) {
  return new Promise(function (resolve) {
    resolve(
      LOADER.load(
        filepath,
        (geometry) => {
          geo = geometry;
        },
      ),
    );
  });
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
