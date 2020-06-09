import * as animationControls from './tools/animation-controls.js';
import * as kbd from './tools/keyboard-shortcuts.js';
import * as menu from './tools/menu.js';
import * as stats from './tools/stats.js';

import * as environments from './environments.js';
import * as renderer from './renderer.js';
import * as radiosity from './radiosity.js';
import { algorithms } from './algorithms.js';

// init on load

window.addEventListener('load', init);

function init() {
  renderer.setup();
  setupUI();

  environments.onEnvironmentChange(changeEnvironment);
  environments.setup(); // calls changeEnvironment with the default one
}

function changeEnvironment(environment) {
  renderer.viewParameters.viewOutput.setTo(false);
  renderer.showEnvironment(environment);
  radiosity.open(environment);
}

function setupUI() {
  menu.setup();
  stats.setup();
  animationControls.setup();
  animationControls.setupDefaultKeys();

  // environment menu selector
  environments.selector.setupHtml('#env');
  environments.selector.setupKeyHandlers(
    ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
    e => (Number(e.key) - 1),
    {
      category: 'Environment',
      description: ['1-9', 'Select environment'],
    },
  );

  // radiosity parameters
  algorithms.setupHtml('#algorithms');
  algorithms.setupSwitchKeyHandler('s', 'Radiosity');

  // view controls
  renderer.viewParameters.gamma.setupHtml('#gamma-slider', renderer.displayGamma);
  renderer.viewParameters.exposure.setupHtml('#exposure-slider', renderer.displayExposure);

  renderer.viewParameters.gamma.setupKeyHandler('g', 'View');
  renderer.viewParameters.exposure.setupKeyHandler('e', 'View');

  renderer.viewParameters.viewOutput.setupHtml('#output-view');
  renderer.viewParameters.viewOutput.setupKeyHandler('Tab', 'View');

  renderer.viewParameters.viewWireframe.setupHtml('#wireframe');
  renderer.viewParameters.viewWireframe.setupKeyHandler('w', 'View');

  renderer.viewParameters.viewGlobalCamera.addExplanation(`
    For slow-light radiosity, global camera sees light as it reaches surfaces,
    while local camera needs the light to arrive at camera position.
    `);
  renderer.viewParameters.viewGlobalCamera.setupHtml('#global');
  renderer.viewParameters.viewGlobalCamera.setupKeyHandler('c', 'View');

  renderer.viewParameters.includeAmbient.addExplanation('ProgRad can show light that is yet to be distributed.');
  renderer.viewParameters.includeAmbient.setupHtml('#ambient');
  renderer.viewParameters.includeAmbient.setupKeyHandler('a', 'View');

  kbd.registerKeyboardShortcut('Escape',
    () => {
      radiosity.stop();
      animationControls.stop();
    },
    {
      category: 'Radiosity',
      description: 'Stop radiosity computation',
    },
  );

  kbd.listKeyboardShortcuts(document.querySelector('#controls'));
}
