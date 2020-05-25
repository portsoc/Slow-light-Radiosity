import * as THREE from '../lib/three.module.js';
import { OrbitControls } from '../lib/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from '../lib/CSS2DRenderer.js';

import * as Rad from '../radiosity/index.js';
import * as Modeling from '../modeling/index.js';

import delayer from './tools/delays.js';
import * as kbd from './tools/keyboard-shortcuts.js';
import * as components from './tools/basic-components.js';
import * as menu from './tools/menu.js';

// list of available environments; the first one is the default

import envRoom1 from '../modeling/test-models/room1.js';
import envRoom613 from '../modeling/test-models/room613.js';
import {
  createTwoCubesInRoom as envCubes,
  createCubeAndLampInRoom as envLamp,
} from '../modeling/test-models/two-cubes.js';

const environments = new components.Selector('environments', [
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

// global variables


let environment;
let renderer;
let renderer2;
let labelRenderer;
let camera;
let camera2;
let scene;
let scene2;
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
const delay = new components.Range('delay', 0, DELAYS.length - 1, 0);

// init on load

window.addEventListener('load', init);

function init() {
  setupRenderer();
  setupHelper();
  setupUI();
  setupEnvironment();
  animate();
}

function setupEnvironment() {
  // find the first environment
  const env = environments.value;

  environment = env.f();

  if (!environment.checkNoVerticesAreShared()) {
    console.log(`environment ${env.name} has vertices shared between surfaces and it should not!`);
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
  updateControls();
}

function setupRenderer() {
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  // include default gamma correction with the following line
  // renderer.outputEncoding = THREE.sRGBEncoding;

  document.body.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);
  controls = new OrbitControls(camera, renderer.domElement);

  material = new THREE.MeshBasicMaterial({
    vertexColors: THREE.FaceColors,
    wireframe: currentViewWireframe.value,
  });
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

function setupHelper() {
  // container
  const frame = document.getElementById('axes-helper-frame');

  // renderer
  renderer2 = new THREE.WebGLRenderer({ alpha: true });
  renderer2.setSize(frame.clientWidth, frame.clientHeight);
  renderer2.setPixelRatio(window.devicePixelRatio);
  renderer2.setClearColor(0x000000, 0);
  frame.appendChild(renderer2.domElement);

  // scene
  scene2 = new THREE.Scene();
  const root = new THREE.Group();
  scene2.add(root);

  // camera
  camera2 = new THREE.PerspectiveCamera(50, frame.clientWidth / frame.clientHeight, 1, 1000);
  camera2.up = camera.up;
  root.add(camera2);

  // label
  labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(frame.clientWidth, frame.clientHeight);
  labelRenderer.domElement.style.position = 'absolute';
  labelRenderer.domElement.style.top = '0px';
  labelRenderer.domElement.style.pointerEvents = 'none';
  frame.appendChild(labelRenderer.domElement);

  // line
  let material;
  let points;
  let geometry;
  let line;

  // x
  material = new THREE.LineBasicMaterial({
    color: new THREE.Color('red'),
    linewidth: 3,
  });
  points = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(1.5, 0, 0),
  ];
  geometry = new THREE.BufferGeometry().setFromPoints(points);

  line = new THREE.Line(geometry, material).rotateX(-Math.PI / 2);
  root.add(line);

  const textX = document.createElement('div');
  textX.className = 'label';
  textX.style.fontFamily = 'Arial Black';
  textX.style.fontWeight = 'bold';
  textX.textContent = 'X';
  textX.style.color = 'red';

  const labelX = new CSS2DObject(textX);
  labelX.position.set(1.8, 0, 0);
  line.add(labelX);

  // y
  material = new THREE.LineBasicMaterial({
    color: new THREE.Color('green'),
    linewidth: 3,
  });
  points = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 1.5, 0),
  ];
  geometry = new THREE.BufferGeometry().setFromPoints(points);
  root.add(new THREE.Line(geometry, material).rotateX(-Math.PI / 2));

  line = new THREE.Line(geometry, material).rotateX(-Math.PI / 2);
  root.add(line);

  const textY = document.createElement('div');
  textY.className = 'label';
  textY.style.fontFamily = 'Arial Black';
  textY.style.fontWeight = 'bold';
  textY.textContent = 'Y';
  textY.style.color = 'green';

  const labelY = new CSS2DObject(textY);
  labelY.position.set(0, 1.8, 0);
  line.add(labelY);

  // z
  material = new THREE.LineBasicMaterial({
    color: new THREE.Color('blue'),
    linewidth: 3,
  });
  points = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 1.5),
  ];
  geometry = new THREE.BufferGeometry().setFromPoints(points);
  root.add(new THREE.Line(geometry, material).rotateX(-Math.PI / 2));

  line = new THREE.Line(geometry, material).rotateX(-Math.PI / 2);
  root.add(line);

  const textZ = document.createElement('div');
  textZ.className = 'label';
  textZ.style.fontFamily = 'Arial Black';
  textZ.style.fontWeight = 'bold';
  textZ.textContent = 'Z';
  textZ.style.color = 'blue';

  const labelZ = new CSS2DObject(textZ);
  labelZ.position.set(0, 0, 1.8);
  line.add(labelZ);
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
  material.needsUpdate = true;
}

function updateControls() {
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
  if (scene2) {
    renderer2.render(scene2, camera2);
    camera2.position.copy(camera.position);
    camera2.position.sub(controls.target);
    camera2.position.setLength(5);
    camera2.lookAt(scene2.position);
    labelRenderer.render(scene2, camera2);
  }
}

let stopRunning = false;
let radiosityRunning = false;
let isSlowRadiosity = false;

async function runRadiosity() {
  try {
    console.log('running radiosity');
    const rad = isSlowRadiosity ? new Rad.SlowRad() : new Rad.ProgRad();
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
  stopRunning = true;
}

function setupUI() {
  menu.setup();

  // environment menu selector
  environments.setupHtml(document.querySelector('#env'));
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

  // light control menu
  gamma.setupHtml(document.querySelector('#gamma-slider'), displayGamma);
  exposure.setupHtml(document.querySelector('#exposure-slider'), displayExposure);

  gamma.setupKeyHandler('g', 'View');
  exposure.setupKeyHandler('e', 'View');

  gamma.addEventListener('change', updateColors);
  exposure.addEventListener('change', updateColors);

  // delay control
  delay.setupHtml(document.querySelector('#delay-slider'), displayDelay);
  delay.setupKeyHandler('d', 'Radiosity');
  delay.addEventListener('change', () => {
    delayer.cancelIfLongerThan(delay.value);
  });

  // view controls
  currentViewOutput.setupHtml(document.querySelector('#output-view'));
  currentViewOutput.setupKeyHandler('Tab', 'View');
  currentViewOutput.addEventListener('change', updateColors);

  currentViewWireframe.setupHtml(document.querySelector('#wireframe'));
  currentViewWireframe.setupKeyHandler('w', 'View');
  currentViewWireframe.addEventListener('change', () => {
    material.wireframe = currentViewWireframe.value;
  });

  currentIncludeAmbient.setupHtml(document.querySelector('#ambient'));
  currentIncludeAmbient.setupKeyHandler('a', 'View');
  currentIncludeAmbient.addEventListener('change', updateColors);

  // radiosity parameters
  overshooting.addExplanation('Overshooting usually makes progressive radiosity faster.');
  overshooting.setupHtml(document.querySelector('#overshoot'));
  overshooting.setupKeyHandler('o', 'Radiosity');

  setupKeyboard();
}

function setupKeyboard() {
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
    () => {
      stopRadiosity();
      delayer.cancel();
    },
    {
      category: 'Radiosity',
      description: 'Stop radiosity computation',
    },
  );

  kbd.registerKeyboardShortcut('s',
    () => {
      isSlowRadiosity = !isSlowRadiosity;
      console.log('slow radiosity', isSlowRadiosity ? 'on' : 'off');
    },
    {
      category: 'Radiosity',
      description: 'Select radiosity algorithm',
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
