import * as Modeling from '../modeling/index.js';

import * as kbd from './tools/keyboard-shortcuts.js';
import * as components from './tools/basic-components.js';
import * as menu from './tools/menu.js';
import * as stats from './tools/stats.js';

import { environmentsList } from './environments.js';
import * as renderer from './renderer.js';
import * as radiosity from './radiosity.js';

const environments = new components.Selector('environment', environmentsList);

// global variables


// init on load

window.addEventListener('load', init);

function init() {
  renderer.setup();
  radiosity.setRenderer(renderer);
  setupUI();
  setupEnvironment();
}

let environment;

function setupEnvironment() {
  environment = environments.value.f();

  if (!environment.checkNoVerticesAreShared()) {
    console.log(`environment ${environments.value.name} has vertices shared between surfaces and it should not!`);
  }

  // translate coordinates so we can see them
  Modeling.coordinates.xyFloorToView(environment);

  renderer.showEnvironment(environment);
  radiosity.reset(environment);
}

function setupUI() {
  menu.setup();
  stats.setup();

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
    radiosity.stop();
    setupEnvironment();
    renderer.viewParameters.viewOutput.setTo(false);
  });

  // radiosity parameters
  radiosity.algorithms.setupHtml('#algorithms');
  radiosity.algorithms.setupSwitchKeyHandler('s', 'Radiosity');

  radiosity.parameters.overshooting.addExplanation('Overshooting usually makes ProgRad faster.');
  radiosity.parameters.overshooting.setupHtml('#overshoot');
  radiosity.parameters.overshooting.setupKeyHandler('o', 'Radiosity');

  radiosity.parameters.delay.setupHtml('#delay-slider', displayDelay);
  radiosity.parameters.delay.setupKeyHandler('d', 'Radiosity');

  // view controls
  renderer.viewParameters.gamma.setupHtml('#gamma-slider', displayGamma);
  renderer.viewParameters.exposure.setupHtml('#exposure-slider', displayExposure);

  renderer.viewParameters.gamma.setupKeyHandler('g', 'View');
  renderer.viewParameters.exposure.setupKeyHandler('e', 'View');

  renderer.viewParameters.viewOutput.setupHtml('#output-view');
  renderer.viewParameters.viewOutput.setupKeyHandler('Tab', 'View');

  renderer.viewParameters.viewWireframe.setupHtml('#wireframe');
  renderer.viewParameters.viewWireframe.setupKeyHandler('w', 'View');

  renderer.viewParameters.includeAmbient.addExplanation('ProgRad can show light that is yet to be distributed.');
  renderer.viewParameters.includeAmbient.setupHtml('#ambient');
  renderer.viewParameters.includeAmbient.setupKeyHandler('a', 'View');

  // remaining keyboard shortcuts
  kbd.registerKeyboardShortcut('Enter',
    () => {
      renderer.viewParameters.viewOutput.setTo(true);
      radiosity.run(environment);
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
      radiosity.stop();
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
  return `${radiosity.parameters.DELAYS[d]}ms`;
}
