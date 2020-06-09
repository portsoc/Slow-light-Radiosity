import { STLLoader } from '../lib/STLLoader.js';
import { Point3, Patch3, Surface3, Instance, Vertex3 } from '../radiosity/index.js';
import { trianglePatchesToSize } from './subdivision.js';

const LOADER = new STLLoader();

// loads an STL and returns a radiosity Instance with every triangle being a patch
// with `maxLength`, triangles with sides longer than the given number get subdivided
// if `subdivideShell` is false, triangles entirely near the bounding box do not get subdivided
export async function loadSTL(filepath, reflectance, emittance, maxLength, subdivideShell = true) {
  const geo = await load(filepath);
  return stlToInstance(geo, reflectance, emittance, maxLength, subdivideShell);
}

function load(filepath) {
  return new Promise(resolve => {
    LOADER.load(filepath, resolve);
  });
}

function stlToInstance(g, reflectance, emittance, maxLength, subdivideShell) {
  // Vertices
  const vertices = [];
  const posArray = g.getAttribute('position').array;

  const bbox = boundingBox(posArray);

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
    const face = [
      vertices[i],
      vertices[i + 1],
      vertices[i + 2],
    ];

    if (maxLength != null && (subdivideShell || !isShellFace(face, bbox))) {
      const newPatches = trianglePatchesToSize(face, maxLength);
      patches.push(...newPatches);
    } else {
      patches.push(new Patch3(face));
    }
  }

  // Surfaces
  const surface = new Surface3(reflectance, emittance, patches);

  // Instance
  return new Instance([surface]);
}

const SHELL_THICKNESS_FACTOR = 0.001;

// posArray is a BufferGeometry `position` attribute array
function boundingBox(posArray) {
  let minX, minY, minZ;
  minX = minY = minZ = Infinity;
  let maxX, maxY, maxZ;
  maxX = maxY = maxZ = -Infinity;

  for (let i = 0; i < posArray.length; i += 3) {
    const x = posArray[i];
    const y = posArray[i + 1];
    const z = posArray[i + 2];

    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    minZ = Math.min(minZ, z);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
    maxZ = Math.max(maxZ, z);
  }

  const xShell = (maxX - minX) * SHELL_THICKNESS_FACTOR;
  const yShell = (maxY - minY) * SHELL_THICKNESS_FACTOR;
  const zShell = (maxZ - minZ) * SHELL_THICKNESS_FACTOR;

  return { minX, minY, minZ, maxX, maxY, maxZ, xShell, yShell, zShell };
}

function isShellFace(vertices, bbox) {
  let nearMinX = true;
  let nearMinY = true;
  let nearMinZ = true;
  let nearMaxX = true;
  let nearMaxY = true;
  let nearMaxZ = true;

  for (const v of vertices) {
    if (v.pos.x - bbox.minX > bbox.xShell) nearMinX = false;
    if (v.pos.y - bbox.minY > bbox.yShell) nearMinY = false;
    if (v.pos.z - bbox.minZ > bbox.zShell) nearMinZ = false;
    if (bbox.maxX - v.pos.x > bbox.xShell) nearMaxX = false;
    if (bbox.maxY - v.pos.y > bbox.yShell) nearMaxY = false;
    if (bbox.maxZ - v.pos.z > bbox.zShell) nearMaxZ = false;
  }

  return nearMinX ||
    nearMinY ||
    nearMinZ ||
    nearMaxX ||
    nearMaxY ||
    nearMaxZ;
}
