import * as Rad from '../radiosity/index.js';

import delayer from './tools/delays.js';
import * as components from './tools/basic-components.js';
import * as stats from './tools/stats.js';

export const algorithms = new components.Selector('radiosity algorithm', [
  {
    Class: Rad.ProgRad,
    name: 'Progressive Radiosity (fast and static light)',
  },
  {
    Class: Rad.SlowRad,
    name: 'Slow-light Radiosity',
  },
]);

const DELAYS = [0, 100, 1000];

export const parameters = {
  overshooting: new components.Toggle('overshooting', false),
  delay: new components.Range('step delay', 0, DELAYS.length - 1, 0),
  DELAYS,
};

let renderer;

export function setRenderer(r) {
  renderer = r;
}

let environment;

export function open(env) {
  environment = env;
  stop(); // in case radiosity was already running

  stats.set('instance-count', environment.instances.length);
  stats.set('surface-count', environment.surfaceCount);
  stats.set('patch-count', environment.patchCount);
  stats.set('element-count', environment.elementCount);
  stats.set('vertex-count', environment.vertexCount);

  // running time and iteration count unknown
  stats.set('running-time', '?');
  stats.set('iteration-count', '?');
}

let stopRunning = false;
let radiosityRunning = false;

export async function run() {
  if (radiosityRunning) return; // already running

  try {
    const rad = new algorithms.value.Class();
    rad.overFlag = parameters.overshooting.value;

    rad.open(environment);
    stats.set('running-time', '–');

    const computationStart = Date.now();

    let pass = 0;
    stopRunning = false;
    radiosityRunning = true;

    while (!rad.calculate()) {
      pass += 1;
      stats.set('iteration-count', pass);
      renderer.beforeNextDisplay(() => {
        rad.prepareForDisplay();
        renderer.updateColors();
      });

      await delayer.delay(DELAYS[parameters.delay.value]);
      if (stopRunning) break;
    }

    const computationEnd = Date.now();

    rad.close();

    if (!stopRunning) {
      stats.set('running-time', computationEnd - computationStart);
      stats.set('iteration-count', pass);
    }

    renderer.beforeNextDisplay(null);
    rad.prepareForDisplay();
    renderer.updateColors();
  } finally {
    radiosityRunning = false;
  }
}

export function stop() {
  delayer.cancel();
  stopRunning = true;
}

// when delay changes, if it's changing to shorter, cancel last delay
parameters.delay.addEventListener('change', () => {
  delayer.cancelIfLongerThan(parameters.delay.value);
});
