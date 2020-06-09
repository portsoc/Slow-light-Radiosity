import { STLLoader } from '../lib/STLLoader.js';
import { Point3, Patch3, Surface3, Instance, Vertex3 } from '../radiosity/index.js';
import { trianglePatchesToSize } from './subdivision.js';

const LOADER = new STLLoader();

export async function loadSTL(filepath, reflectance, emittance, maxLength) {
  const geo = await load(filepath);
  return stlToInstance(geo, reflectance, emittance, maxLength);
}

function load(filepath) {
  return new Promise(resolve => {
    LOADER.load(filepath, resolve);
  });
}

function stlToInstance(g, reflectance, emittance, maxLength) {
  // Vertices
  const vertices = [];
  const posArray = g.getAttribute('position').array;
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
    if (maxLength != null) {
      const newPatches = trianglePatchesToSize(
        [
          vertices[i],
          vertices[i + 1],
          vertices[i + 2],
        ],
        maxLength,
      );
      patches.push(...newPatches);
    } else {
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
  }

  // Surfaces
  const surface = new Surface3(reflectance, emittance, patches);

  // Instance
  return new Instance([surface]);
}
