import * as Rad from '../radiosity/index.js';
import * as Modeling from '../modeling/index.js';

import delayer from './tools/delays.js';
import * as kbd from './tools/keyboard-shortcuts.js';
import * as components from './tools/basic-components.js';
import * as menu from './tools/menu.js';

import { environmentsList } from './environments.js';
import * as renderer from './renderer.js';

const environments = new components.Selector('environment', environmentsList);
const algorithms = new components.Selector('radiosity algorithm', [
  {
    Class: Rad.ProgRad,
    name: 'Progressive Radiosity (fast and static light)',
  },
  {
    Class: Rad.SlowRad,
    name: 'Slow-light Radiosity',
  },
]);

// global variables


const overshooting = new components.Toggle('overshooting', false);

const DELAYS = [0, 100, 1000];
const delay = new components.Range('step delay', 0, DELAYS.length - 1, 0);

// init on load

window.addEventListener('load', init);

function init() {
  renderer.setup();
  setupUI();
  setupEnvironment();
}

let environment;

function setupEnvironment() {
  environment = environments.value.f();

  if (!environment.checkNoVerticesAreShared()) {
    console.log(`environment ${environments.value.name} has vertices shared between surfaces and it should not!`);
  }

  document.getElementById('instance-count').textContent = environment.instances.length;
  document.getElementById('surface-count').textContent = environment.surfaceCount;
  document.getElementById('patch-count').textContent = environment.patchCount;
  document.getElementById('element-count').textContent = environment.elementCount;
  document.getElementById('vertex-count').textContent = environment.vertexCount;

  // reset running time and iteration count
  document.getElementById('running-time').textContent = '?';
  document.getElementById('iteration-count').textContent = '?';

  // translate coordinates so we can see them
  Modeling.coordinates.xyFloorToView(environment);

  renderer.showEnvironment(environment);
}

let stopRunning = false;
let radiosityRunning = false;

async function runRadiosity() {
  try {
    console.log('running radiosity');
    const rad = new algorithms.value.Class();
    rad.overFlag = overshooting.value;

    rad.open(environment);
    document.getElementById('running-time').textContent = '–';

    const computationStart = Date.now();

    let pass = 0;
    stopRunning = false;
    radiosityRunning = true;

    while (!rad.calculate()) {
      pass += 1;
      document.getElementById('iteration-count').textContent = pass;
      renderer.beforeNextDisplay(() => {
        rad.prepareForDisplay();
        renderer.updateColors();
      });

      await delayer.delay(DELAYS[delay.value]);
      if (stopRunning) break;
    }

    const computationEnd = Date.now();

    rad.close();
    console.log('done');

    document.getElementById('running-time').textContent = computationEnd - computationStart;
    document.getElementById('iteration-count').textContent = pass;

    renderer.beforeNextDisplay(null);
    rad.prepareForDisplay();
    renderer.updateColors();
  } finally {
    radiosityRunning = false;
  }
}

function stopRadiosity() {
  delayer.cancel();
  stopRunning = true;
}

function setupUI() {
  menu.setup();

  // environment menu selector
  environments.setupHtml('#env');
  environments.setupKeyHandlers(
    ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
    e => (Number(e.key) - 1),
    {
      category: 'Environment',
      description: ['1-9', 'Select environment'],
    },
  );
  environments.addEventListener('change', () => {
    stopRadiosity();
    setupEnvironment();
    renderer.viewParameters.viewOutput.setTo(false);
  });

  algorithms.setupHtml('#algorithms');
  algorithms.setupSwitchKeyHandler('s', 'Radiosity');

  // light control menu
  renderer.viewParameters.gamma.setupHtml('#gamma-slider', displayGamma);
  renderer.viewParameters.exposure.setupHtml('#exposure-slider', displayExposure);

  renderer.viewParameters.gamma.setupKeyHandler('g', 'View');
  renderer.viewParameters.exposure.setupKeyHandler('e', 'View');

  // delay control
  delay.setupHtml('#delay-slider', displayDelay);
  delay.setupKeyHandler('d', 'Radiosity');
  delay.addEventListener('change', () => {
    delayer.cancelIfLongerThan(delay.value);
  });

  // view controls
  renderer.viewParameters.viewOutput.setupHtml('#output-view');
  renderer.viewParameters.viewOutput.setupKeyHandler('Tab', 'View');

  renderer.viewParameters.viewWireframe.setupHtml('#wireframe');
  renderer.viewParameters.viewWireframe.setupKeyHandler('w', 'View');

  renderer.viewParameters.includeAmbient.addExplanation('ProgRad can show light that is yet to be distributed.');
  renderer.viewParameters.includeAmbient.setupHtml('#ambient');
  renderer.viewParameters.includeAmbient.setupKeyHandler('a', 'View');

  // radiosity parameters
  overshooting.addExplanation('Overshooting usually makes ProgRad faster.');
  overshooting.setupHtml('#overshoot');
  overshooting.setupKeyHandler('o', 'Radiosity');

  // remaining keyboard shortcuts
  kbd.registerKeyboardShortcut('Enter',
    () => {
      if (!radiosityRunning) runRadiosity();
      renderer.viewParameters.viewOutput.setTo(true);
    },
    {
      category: 'Radiosity',
      description: 'Start radiosity computation',
    },
  );

  kbd.registerKeyboardShortcut('Escape',
    (e) => {
      if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) {
        return false;
      }
      stopRadiosity();
    },
    {
      category: 'Radiosity',
      description: 'Stop radiosity computation',
    },
  );

  kbd.listKeyboardShortcuts(document.querySelector('#controls'));
}


function displayGamma(gamma) {
  return (gamma / 10).toFixed(1);
}

function displayExposure(exposure) {
  return (exposure > 0 ? '+' : '') + (exposure / 10).toFixed(1);
}

function displayDelay(d) {
  return `${DELAYS[d]}ms`;
}
