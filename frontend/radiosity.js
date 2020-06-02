import * as animationControls from './tools/animation-controls.js';
import * as stats from './tools/stats.js';
import * as renderer from './renderer.js';
import { algorithms } from './algorithms.js';
import { burstingDelay } from './tools/delays.js';

let environment;

export function open(env) {
  environment = env;

  if (!env) {
    stop();
    return;
  }

  stats.set('instance-count', environment.instances.length);
  stats.set('surface-count', environment.surfaceCount);
  stats.set('patch-count', environment.patchCount);
  stats.set('element-count', environment.elementCount);
  stats.set('vertex-count', environment.vertexCount);

  stats.set('iteration-count', '?');

  const alg = algorithms.value.instance;
  bufferingIterator = alg.open(env);

  animationControls.setMaxTime(alg.maxTime);
  animationControls.reset();

  startBuffering();
}

algorithms.addEventListener('change', reopen);

function reopen() {
  if (environment) {
    open(environment);
  }
}

let bufferingRunning = false;
let bufferingIterator = null;

async function startBuffering() {
  if (bufferingRunning) return; // already running, will pick up the new iterator automatically

  try {
    bufferingRunning = true;

    let next = bufferingIterator.next();
    while (!next.done) {
      updateBufTime(next.value);

      await burstingDelay();
      if (!bufferingIterator) break;

      next = bufferingIterator.next();
    }
  } finally {
    bufferingIterator = null;
    bufferingRunning = false;
  }
}

export function stop() {
  bufferingIterator = null;
}

function updateBufTime(statusValue) {
  animationControls.setBufferedFraction(statusValue.curr / statusValue.max);
}

animationControls.setShowCallback(show);

function show(time) {
  if (!environment) return; // nothing to show

  if (time !== 0) renderer.viewParameters.viewOutput.setTo(true);

  const alg = algorithms.value.instance;
  const oldMaxTime = alg.maxTime;

  const changedColors = alg.show(time);

  if (changedColors) {
    renderer.updateColors();
  }

  if (oldMaxTime !== alg.maxTime) {
    animationControls.setMaxTime(alg.maxTime);
  }

  stats.set('iteration-count', alg.maxTime);
  stats.set('current-step', time);
}
