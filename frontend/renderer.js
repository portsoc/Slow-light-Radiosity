import * as THREE from '../lib/three.module.js';
import { OrbitControls } from '../lib/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from '../lib/CSS2DRenderer.js';

import * as Rad from '../radiosity/index.js';
import * as Modeling from '../modeling/index.js';

// list of available environments; the first one is the default

import envRoom from '../modeling/test-models/room1.js';
import { createTwoCubesInRoom as envCubes } from '../modeling/test-models/two-cubes.js';

const environmentFunctions = [
  envRoom,
  envCubes,
];

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

let currentViewVertex = false; // the current view is either vertex (radiosity) or shaded
let currentWireframe = false;

let gamma = 22; // scaled by 10, so really 2.2
let exposure = 10; // scaled by 10, so really 1.0

// init on load

window.addEventListener('load', init);

function init() {
  setupRenderer();
  setupHelper();
  selectNextEnvironment();
  animate();

  setupEventListeners();
}

function selectNextEnvironment() {
  // find the first environment
  if (!environmentFunctions.firstOneSelected) {
    environmentFunctions.firstOneSelected = true;
  } else {
    // move first environment to the end of the queue
    environmentFunctions.push(environmentFunctions.shift());
  }
  const envFunc = environmentFunctions[0];

  environment = envFunc();

  console.log('selecting environment', envFunc.name);
  if (!environment.checkNoVerticesAreShared()) {
    console.log('environment has vertices shared between surfaces and it should not!');
  }

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
  const frame = document.getElementById('cube-helper-frame');

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
  for (const instance of environment.instances) {
    for (const surface of instance.surfaces) {
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
                  gamma);
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

function setThreeColorFromRad(col, exit, emit, exposure = 10, gamma = 10) {
  exposure /= 10;
  gamma = 10 / gamma;
  col.setRGB(
    ((exit.r + emit.r) * exposure) ** gamma,
    ((exit.g + emit.g) * exposure) ** gamma,
    ((exit.b + emit.b) * exposure) ** gamma,
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

function animate() {
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
  if (e.key === 'w') {
    currentWireframe = !currentWireframe;
    material.wireframe = currentWireframe;
    e.preventDefault();
  }
  if (e.key === 'Tab') {
    currentViewVertex = !currentViewVertex;
    updateColors();
    e.preventDefault();
  }
  if (e.key === 'Enter') {
    runRadiosity();
    e.preventDefault();
  }
  if (e.key.toLowerCase() === 'g') {
    gamma += e.shiftKey ? 1 : -1;
    console.log(`gamma ${(gamma / 10).toFixed(1)}`);
    updateColors();
  }
  if (e.key.toLowerCase() === 'e') {
    exposure += e.shiftKey ? 1 : -1;
    console.log(`exposure ${(exposure / 10).toFixed(1)}`);
    updateColors();
  }
}

async function runRadiosity() {
  console.log('running radiosity');
  const rad = new Rad.ProgRad();
  rad.open(environment);
  while (!rad.calculate()) {
    console.log('pass');

    rad.prepareForDisplay();
    updateColors();

    await delayTimeout(100);
  }
  rad.close();
  console.log('done');

  updateColors();

  window.env = environment;
}

function delayTimeout(ms = 1) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
