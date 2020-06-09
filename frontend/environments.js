import * as components from './tools/basic-components.js';

import envRoom1 from '../modeling/test-models/room1.js';
import envRoom2 from '../modeling/test-models/room2.js';
import envRoom613 from '../modeling/test-models/room613.js';
import {
  createTwoCubesInRoom as envCubes,
  createCubeAndLampInRoom as envLamp,
} from '../modeling/test-models/two-cubes.js';
import createMaze from '../modeling/test-models/maze.js';
import twoFaces from '../modeling/test-models/two-faces.js';

// list of available environments; the first one is the default

const environmentsList = [
  {
    f: twoFaces,
    name: 'Simple room',
  },
  {
    f: envRoom613,
    name: 'Figure 6.13 room (from the book)',
  },
  {
    f: () => envCubes(5), // 5x5 elements, single patch
    name: 'Two cubes',
  },
  {
    f: () => envCubes(5, true), // 5x5 patches
    name: 'Two cubes subdivided into patches',
  },
  {
    f: () => envLamp(5, true),
    name: 'A cube and a lamp',
  },
  {
    f: envRoom2,
    name: 'Corridor with a single light',
  },
  {
    f: createMaze,
    name: 'A maze with some light sources',
  },
  {
    f: () => createMaze(8),
    name: 'Same maze but subdivided (very slow!)',
  },
];

export const selector = new components.Selector('environment', environmentsList);

async function createEnvironment() {
  const environment = await selector.value.f();

  if (!environment.checkNoVerticesAreShared()) {
    console.warn(`environment ${selector.value.name} has vertices shared between surfaces and it should not!`);
  }

  if (listener) listener(environment);
}


export function setup() {
  createEnvironment();

  selector.addEventListener('change', () => {
    createEnvironment();
  });
}


let listener;

export function onEnvironmentChange(f) {
  listener = f;
}
