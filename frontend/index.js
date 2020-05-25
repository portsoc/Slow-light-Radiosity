import * as THREE from '../lib/three.module.js';
import { OrbitControls } from '../lib/OrbitControls.js';

import * as Rad from '../radiosity/index.js';
import * as Modeling from '../modeling/index.js';

import delayer from './tools/delays.js';
import * as kbd from './tools/keyboard-shortcuts.js';
import * as components from './tools/basic-components.js';
import * as menu from './tools/menu.js';
import * as axes from './tools/axes.js';

// list of available environments; the first one is the default

import envRoom1 from '../modeling/test-models/room1.js';
import envRoom613 from '../modeling/test-models/room613.js';
import {
  createTwoCubesInRoom as envCubes,
  createCubeAndLampInRoom as envLamp,
} from '../modeling/test-models/two-cubes.js';

const environments = new components.Selector('environment', [
  {
    f: envRoom1,
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
]);

const algorithms = new components.Selector('radiosity algorithm', [
  {
    C: Rad.ProgRad,
    name: 'Progressive Radiosity (fast and static light)',
  },
  {
    C: Rad.SlowRad,
    name: 'Slow-light Radiosity',
  },
]);

// global variables


let environment;
let renderer;
let camera;
let scene;
let controls;
let material;
let geometry;

const currentViewOutput = new components.Toggle('view radiosity output', false); // the current view is either vertex (radiosity) or shaded
const currentViewWireframe = new components.Toggle('wireframe view', false);
const currentIncludeAmbient = new components.Toggle('show ambient light', false);

const overshooting = new components.Toggle('overshooting', false);

// gamma scaled by 10 for integer arithmetic, so default really 2.2
const gamma = new components.Range('gamma', 1, 100, 22);

// exposure positive or negative, also scaled by 10; actual exposure factor is 1.1^exposure
const exposure = new components.Range('exposure', -50, 50, 0);

const DELAYS = [0, 100, 1000];
const delay = new components.Range('step delay', 0, DELAYS.length - 1, 0);

// init on load

window.addEventListener('load', init);

function init() {
  setupRenderer();
  setupAxes();
  setupUI();
  setupEnvironment();
  animate();
}

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

  setupRendererScene();
  updateControlsForEnvironment();
}

function setupRenderer() {
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);

  // include default gamma correction with the following line
  // renderer.outputEncoding = THREE.sRGBEncoding;

  document.body.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(100, 1, 0.1, 1000);
  controls = new OrbitControls(camera, renderer.domElement);

  material = new THREE.MeshBasicMaterial({
    vertexColors: THREE.FaceColors,
    wireframe: currentViewWireframe.value,
  });

  setViewSize();
  window.addEventListener('resize', setViewSize);
}

function setViewSize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

function setupRendererScene() {
  scene = new THREE.Scene();
  const bgColor = window.getComputedStyle(document.body).getPropertyValue('--bg').trim();
  scene.background = new THREE.Color(bgColor);
  geometry = new THREE.Geometry();

  for (const instance of environment.instances) {
    const vertices = instance.vertices;

    // * Read vertices
    for (const vertex of vertices) {
      const threeVertex = new THREE.Vector3(
        vertex.pos.x,
        vertex.pos.y,
        vertex.pos.z,
      );

      vertex._threeIndex = geometry.vertices.length;
      vertex._threeVertex = threeVertex;
      geometry.vertices.push(threeVertex);
    }

    // * Read faces
    for (const surface of instance.surfaces) {
      for (const patch of surface.patches) {
        for (const element of patch.elements) {
          addFace(geometry, element, [0, 1, 2]);
          if (element.isQuad) {
            addFace(geometry, element, [0, 2, 3]);
          }
        }
      }
    }
  }
  scene.add(new THREE.Mesh(geometry, material));

  updateColors();
}

function addFace(geometry, element, vertexIndices) {
  const face = new THREE.Face3(
    element.vertices[vertexIndices[0]]._threeIndex,
    element.vertices[vertexIndices[1]]._threeIndex,
    element.vertices[vertexIndices[2]]._threeIndex,
  );
  geometry.faces.push(face);

  for (let i = 0; i < 3; i += 1) {
    face.vertexColors[i] = new THREE.Color();
  }

  // add a backlink so we can get to the three.js faces from the element
  if (!element._threeFaces) element._threeFaces = [];
  element._threeFaces.push(face);

  // add a backlink so we can get to Rad vertices from three.js faces
  face._radVertices = [
    element.vertices[vertexIndices[0]],
    element.vertices[vertexIndices[1]],
    element.vertices[vertexIndices[2]],
  ];
}

function setupAxes() {
  axes.setup('#axes-helper-frame');
}

function updateColors() {
  const deltaAmbient = (currentIncludeAmbient.value && environment.ambient) ? new Rad.Spectra() : undefined;
  const surfaceColor = new Rad.Spectra();

  for (const surface of environment.surfaces) {
    if (deltaAmbient) {
      deltaAmbient.setTo(environment.ambient);
      deltaAmbient.multiply(surface.reflectance);
    }

    if (!currentViewOutput.value) {
      surfaceColor.setTo(surface.emittance);
      surfaceColor.add(surface.reflectance);
    }

    for (const patch of surface.patches) {
      for (const element of patch.elements) {
        for (const face of element._threeFaces) {
          for (let i = 0; i < 3; i += 1) {
            if (currentViewOutput.value) {
              surfaceColor.setTo(face._radVertices[i].exitance);
              if (deltaAmbient) surfaceColor.add(deltaAmbient);
              surfaceColor.scale(1.1 ** exposure.value);
              surfaceColor.exp(10 / gamma.value);
            }
            face.vertexColors[i].setRGB(surfaceColor.r, surfaceColor.g, surfaceColor.b);
          }
        }
      }
    }
  }

  geometry.colorsNeedUpdate = true;
}

function updateControlsForEnvironment() {
  const bounds = environment.boundingBox;
  const roomCenter = new Rad.Point3(
    (bounds[0].x + bounds[1].x) / 2,
    (bounds[0].y + bounds[1].y) / 2,
    (bounds[0].z + bounds[1].z) / 2,
  );

  camera.position.x = roomCenter.x;
  camera.position.y = roomCenter.y;
  camera.position.z = 2 * bounds[1].z - bounds[0].z;


  const diagonal = new Rad.Vector3(bounds[0], bounds[1]);

  controls.target = new THREE.Vector3(roomCenter.x, roomCenter.y, roomCenter.z);
  controls.maxDistance = diagonal.length * 2;
  controls.minDistance = diagonal.length / 10;
  controls.panBBox = {
    min: {
      x: bounds[0].x,
      y: bounds[0].y,
      z: bounds[0].z,
    },
    max: {
      x: bounds[1].x,
      y: bounds[1].y,
      z: bounds[1].z,
    },
  };
  controls.update();
}

// if the radiosity algorithm changed the model in visible ways that
// need preprocessing before updating the Three.js model, it can
// register here a function that will do that preprocessing
let updateForDisplay;

function animate() {
  if (updateForDisplay) {
    updateForDisplay();
    updateForDisplay = null;
  }
  requestAnimationFrame(animate);
  if (scene) renderer.render(scene, camera);
  axes.update(camera, controls);
  axes.render();
}

let stopRunning = false;
let radiosityRunning = false;

async function runRadiosity() {
  try {
    console.log('running radiosity');
    const rad = new algorithms.value.C();
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
      updateForDisplay = () => {
        rad.prepareForDisplay();
        updateColors();
      };

      await delayer.delay(DELAYS[delay.value]);
      if (stopRunning) break;
    }

    const computationEnd = Date.now();

    rad.close();
    console.log('done');

    document.getElementById('running-time').textContent = computationEnd - computationStart;
    document.getElementById('iteration-count').textContent = pass;

    updateForDisplay = null;
    rad.prepareForDisplay();
    updateColors();
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
  });

  algorithms.setupHtml('#algorithms');
  algorithms.setupSwitchKeyHandler('s', 'Radiosity');

  // light control menu
  gamma.setupHtml('#gamma-slider', displayGamma);
  exposure.setupHtml('#exposure-slider', displayExposure);

  gamma.setupKeyHandler('g', 'View');
  exposure.setupKeyHandler('e', 'View');

  gamma.addEventListener('change', updateColors);
  exposure.addEventListener('change', updateColors);

  // delay control
  delay.setupHtml('#delay-slider', displayDelay);
  delay.setupKeyHandler('d', 'Radiosity');
  delay.addEventListener('change', () => {
    delayer.cancelIfLongerThan(delay.value);
  });

  // view controls
  currentViewOutput.setupHtml('#output-view');
  currentViewOutput.setupKeyHandler('Tab', 'View');
  currentViewOutput.addEventListener('change', updateColors);

  currentViewWireframe.setupHtml('#wireframe');
  currentViewWireframe.setupKeyHandler('w', 'View');
  currentViewWireframe.addEventListener('change', () => {
    material.wireframe = currentViewWireframe.value;
  });

  currentIncludeAmbient.addExplanation('ProgRad can show light that is yet to be distributed.');
  currentIncludeAmbient.setupHtml('#ambient');
  currentIncludeAmbient.setupKeyHandler('a', 'View');
  currentIncludeAmbient.addEventListener('change', updateColors);

  // radiosity parameters
  overshooting.addExplanation('Overshooting usually makes ProgRad faster.');
  overshooting.setupHtml('#overshoot');
  overshooting.setupKeyHandler('o', 'Radiosity');

  // remaining keyboard shortcuts
  kbd.registerKeyboardShortcut('Enter',
    () => {
      if (!radiosityRunning) runRadiosity();
      currentViewOutput.setTo(true);
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
