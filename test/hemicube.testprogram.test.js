import Environment from '../radiosity/environment.js';
import HemiCube from '../radiosity/hemicube.js';
import Vertex3 from '../radiosity/vertex3.js';
import Point3 from '../radiosity/point3.js';
import Surface3 from '../radiosity/surface3.js';
import Spectra from '../radiosity/spectra.js';
import Patch3 from '../radiosity/patch3.js';
import Instance from '../radiosity/instance.js';

let ENV;                       // Environment
const HEMI = new HemiCube();   // HemiCube

test('HemiCube Test Program', () => {
  main();
  expect(true).toBe(true);
});

function main() {
  // Initialize environment
  ENV = environmentInitialization();

  // Allocate form factor array
  const ffArray = new Array(ENV.elementCount);

  // Calculate and display form factors
  calculate(ffArray, ENV.elementCount);
}

function environmentInitialization() {
  // ? First square

  // vertices
  const vertices = [
    new Vertex3(new Point3(0.5, -0.5, 0)),
    new Vertex3(new Point3(0.5, 0.5, 0)),
    new Vertex3(new Point3(-0.5, 0.5, 0)),
    new Vertex3(new Point3(-0.5, -0.5, 0)),
  ];

  // patch
  const patches = [
    new Patch3(vertices),
  ];

  // surface
  const surfaces = [
    new Surface3(
      new Spectra(1, 0, 0),
      new Spectra(0, 0, 0),
      patches,
    ),
  ];

  // ? Second square

  // vertices
  const vertices2 = [
    new Vertex3(new Point3(0.5, -0.5, 1)),
    new Vertex3(new Point3(0.5, 0.5, 1)),
    new Vertex3(new Point3(-0.5, 0.5, 1)),
    new Vertex3(new Point3(-0.5, -0.5, 1)),
  ];

  // patch
  const patches2 = [
    new Patch3(vertices2),
  ];

  // surface
  const surfaces2 = [
    new Surface3(
      new Spectra(1, 0, 0),
      new Spectra(0, 0, 0),
      patches2,
    ),
  ];

  // ? Environment

  // instance
  const instances = [
    new Instance(surfaces),
    new Instance(surfaces2),
  ];

  // set environment
  const env = new Environment(instances);

  return env;
}

function calculate(ffArray, elementCount) {
  let srcId = 1;   // Source polygon indentifier

  for (const instance of ENV.instances) {
    for (const surface of instance.surfaces) {
      for (const patch of surface.patches) {
        // Calculate patch to element form factor
        HEMI.calculateFormFactors(patch, ENV, ffArray);

        // Report form factors
        console.log(`Patch ${srcId}`);

        for (let rcvId = 0; rcvId < elementCount; rcvId++) {
          console.log(` FF(${srcId},${rcvId + 1}) = ${ffArray[rcvId]}`);
        }

        srcId++;
      }
    }
  }
}
