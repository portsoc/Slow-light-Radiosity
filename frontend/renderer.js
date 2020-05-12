import * as THREE from '../lib/three.module.js';
import { OrbitControls } from '../lib/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from '../lib/CSS2DRenderer.js';

import * as Rad from '../radiosity/index.js';
import * as Modeling from '../modeling/index.js';

import delays from './tools/delays.js';
import setupMenu from './menu.js';

// list of available environments; the first one is the default

import envRoom1 from '../modeling/test-models/room1.js';
import envRoom613 from '../modeling/test-models/room613.js';
import { createTwoCubesInRoom as envCubes } from '../modeling/test-models/two-cubes.js';

const environmentFunctions = [
  envRoom1,
  envRoom613,
  () => envCubes(5), // 5x5 elements, single patch
  () => envCubes(5, true), // 5x5 patches
];

// environment menu selector

let envPreviousId = 0;
function selectEnv(env, n) {
  event.stopPropagation();

  // unselect previous environment
  const p = document.getElementById('env-selected');
  p.textContent = 'Environment ' + envPreviousId;
  p.removeAttribute('id');

  // select environment
  env.setAttribute('id', 'env-selected');
  env.textContent = 'Environment ' + n + ' ◄';
  envPreviousId = n;

  // update environment
  currentEnvironment = n;
  setupEnvironment();
}

// set up selector
const envSelector = document.getElementById('env');
for (let i = 0; i < environmentFunctions.length; i++) {
  const envDiv = document.createElement('div');
  envDiv.textContent = 'Environment ' + i;
  if (i === 0) {
    envDiv.setAttribute('id', 'env-selected');
    envDiv.textContent += ' ◄';
  }
  envDiv.addEventListener('click', () => selectEnv(envDiv, i));
  envSelector.appendChild(envDiv);
}

// light control menu

// set up slider
const sg = document.getElementById('gamma-slider');
const se = document.getElementById('exposure-slider');
sg.addEventListener('input', () => {
  event.stopPropagation();
  gamma = sg.value * 10;
  updateColors();
});
se.addEventListener('input', () => {
  event.stopPropagation();
  exposure = se.value * 10;
  updateColors();
});
sg.addEventListener('click', () => event.stopPropagation());
se.addEventListener('click', () => event.stopPropagation());

// delay selector
const d1 = document.getElementById('delay-1');
const d100 = document.getElementById('delay-100');
const d1000 = document.getElementById('delay-1000');
d1.addEventListener('click', () => {
  event.stopPropagation();

  d1.classList.add('selected');
  d100.classList.remove('selected');
  d1000.classList.remove('selected');

  delays.current = 0;
});
d100.addEventListener('click', () => {
  event.stopPropagation();

  d1.classList.remove('selected');
  d100.classList.add('selected');
  d1000.classList.remove('selected');

  delays.current = 1;
});
d1000.addEventListener('click', () => {
  event.stopPropagation();

  d1.classList.remove('selected');
  d100.classList.remove('selected');
  d1000.classList.add('selected');

  delays.current = 2;
});

// mode menu

const a = document.getElementById('ambient');
const o = document.getElementById('overshoot');
const w = document.getElementById('wireframe');
a.addEventListener('click', () => {
  event.stopPropagation();

  if (currentIncludeAmbient) {
    a.classList.add('disabled');
  } else {
    a.classList.remove('disabled');
  }
  currentIncludeAmbient = !currentIncludeAmbient;

  updateColors();
});
o.addEventListener('click', () => {
  event.stopPropagation();

  if (overshooting) {
    o.classList.add('disabled');
  } else {
    o.classList.remove('disabled');
  }
  overshooting = !overshooting;

  updateColors();
});
w.addEventListener('click', () => {
  event.stopPropagation();

  if (currentWireframe) {
    w.classList.add('disabled');
  } else {
    w.classList.remove('disabled');
  }
  currentWireframe = !currentWireframe;

  material.wireframe = currentWireframe;
});

// global variables

let currentEnvironment = 0;

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

let currentViewVertex = false; // the current view is either vertex (radiosity) or shaded
let currentWireframe = false;
let currentIncludeAmbient = false;

let overshooting = false;

let gamma = 22; // scaled by 10, so really 2.2
let exposure = 10; // scaled by 10, so really 1.0

// init on load

window.addEventListener('load', init);

function init() {
  setupRenderer();
  setupHelper();
  setupMenu();
  setupEnvironment();
  animate();

  setupEventListeners();
}

function setupEnvironment() {
  // find the first environment
  const envFunc = environmentFunctions[currentEnvironment];

  environment = envFunc();

  console.log('selecting environment', envFunc.name);
  if (!environment.checkNoVerticesAreShared()) {
    console.log('environment has vertices shared between surfaces and it should not!');
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
    wireframe: currentWireframe,
  });
}

function setupRendererScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x2d3436);
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
  const deltaAmbient = (currentIncludeAmbient && environment.ambient) ? new Rad.Spectra() : undefined;
  for (const instance of environment.instances) {
    for (const surface of instance.surfaces) {
      if (deltaAmbient) {
        deltaAmbient.setTo(environment.ambient);
        deltaAmbient.multiply(surface.reflectance);
      }

      for (const patch of surface.patches) {
        for (const element of patch.elements) {
          for (const face of element._threeFaces) {
            for (let i = 0; i < 3; i += 1) {
              if (!face.vertexColors[i]) face.vertexColors[i] = new THREE.Color();

              if (currentViewVertex) {
                setThreeColorFromRad(
                  face.vertexColors[i],
                  face._radVertices[i].exitance,
                  surface.emittance,
                  exposure,
                  gamma,
                  deltaAmbient);
              } else {
                // shaded
                setThreeColorFromRad(
                  face.vertexColors[i],
                  surface.reflectance,
                  surface.emittance);
              }
            }
          }
        }
      }
    }
  }
  geometry.colorsNeedUpdate = true;
  material.needsUpdate = true;
}

const NO_AMBIENT = new Rad.Spectra();
function setThreeColorFromRad(threeColor, exit, emit, exposure = 10, gamma = 10, ambient = NO_AMBIENT) {
  exposure /= 10;
  gamma = 10 / gamma;
  threeColor.setRGB(
    ((exit.r + emit.r + ambient.r) * exposure) ** gamma,
    ((exit.g + emit.g + ambient.g) * exposure) ** gamma,
    ((exit.b + emit.b + ambient.b) * exposure) ** gamma,
  );
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

function setupEventListeners() {
  document.addEventListener('keydown', keyListener);
}

function keyListener(e) {
  if (e.key === 'Enter') {
    if (!radiosityRunning) runRadiosity();
    currentViewVertex = true;
    updateColors();
    e.preventDefault();
  }
  if (e.key === 'Escape') {
    stopRadiosity();
    delays.cancel();
    e.preventDefault();
  }
  if (e.key === 'Tab') {
    currentViewVertex = !currentViewVertex;
    updateColors();
    e.preventDefault();
  }
  if (e.key.toLowerCase() === 'a') {
    currentIncludeAmbient = !currentIncludeAmbient;
    console.log('ambient', currentIncludeAmbient ? 'on' : 'off');
    updateColors();
    e.preventDefault();
  }
  if (e.key.toLowerCase() === 'd') {
    const newDelay = delays.selectNextDelay();
    console.log(`delay ${newDelay}ms`);
    e.preventDefault();
  }
  if (e.key.toLowerCase() === 'e') {
    exposure += e.shiftKey ? 1 : -1;
    console.log(`exposure ${(exposure / 10).toFixed(1)}`);
    updateColors();
    e.preventDefault();
  }
  if (e.key.toLowerCase() === 'g') {
    gamma += e.shiftKey ? 1 : -1;
    console.log(`gamma ${(gamma / 10).toFixed(1)}`);
    updateColors();
    e.preventDefault();
  }
  if (e.key === 'o') {
    overshooting = !overshooting;
    console.log('overshooting', overshooting ? 'on' : 'off');
    e.preventDefault();
  }
  if (e.key === 'w') {
    currentWireframe = !currentWireframe;
    material.wireframe = currentWireframe;
    e.preventDefault();
  }
  if (e.key >= '1' && e.key <= '9' && !e.metaKey && !e.altKey && !e.ctrlKey) {
    const newEnv = (Number(e.key) - 1) % environmentFunctions.length;

    if (currentEnvironment !== newEnv) {
      currentEnvironment = newEnv;

      stopRadiosity();
      console.log('environment', currentEnvironment);
      setupEnvironment();
      e.preventDefault();
    }
  }
}

let stopRunning = false;
let radiosityRunning = false;

async function runRadiosity() {
  try {
    console.log('running radiosity');
    const rad = new Rad.ProgRad();
    rad.overFlag = overshooting;

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

      await delays.delay();
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
