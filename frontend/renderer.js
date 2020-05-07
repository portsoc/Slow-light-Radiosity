import * as THREE from '../lib/three.module.js';
import { OrbitControls } from '../lib/OrbitControls.js';

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
let camera;
let scene;
let controls;
let material;
let geometry;

let currentViewVertex = false; // the current view is either vertex (radiosity) or shaded
let currentWireframe = false;

// init on load

window.addEventListener('load', init);

function init() {
  setupRenderer();
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

  addAxes(scene);
  updateSceneColors();
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

function addAxes(scene) {
  const axesHelper = new THREE.AxesHelper(1);

  // rotate to agree with model coordinates
  axesHelper.rotation.x = -Math.PI / 2;
  axesHelper.position.x = -0.5;
  axesHelper.position.y = -0.5;
  axesHelper.position.z = 0.5;
  scene.add(axesHelper);
}

function updateSceneColors() {
  if (currentViewVertex) {
    // vertex view - every vertex gets its color from the radiosity model
    console.log('vertex colors');
    for (const instance of environment.instances) {
      for (const surface of instance.surfaces) {
        for (const patch of surface.patches) {
          for (const element of patch.elements) {
            for (const face of element._threeFaces) {
              for (let i = 0; i < 3; i += 1) {
                if (!face.vertexColors[i]) face.vertexColors[i] = new THREE.Color();
                setThreeColorFromRad(face.vertexColors[i], face._radVertices[i].exitance);
              }
            }
          }
        }
      }
    }
  } else {
    // shaded view - every surface has a solid color
    console.log('shaded colors');
    for (const instance of environment.instances) {
      for (const surface of instance.surfaces) {
        const color = new Rad.Spectra(surface.reflectance);
        color.add(surface.emittance);

        for (const patch of surface.patches) {
          for (const element of patch.elements) {
            for (const face of element._threeFaces) {
              for (let i = 0; i < 3; i += 1) {
                if (!face.vertexColors[i]) face.vertexColors[i] = new THREE.Color();
                setThreeColorFromRad(face.vertexColors[i], color);
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

function setThreeColorFromRad(col, spectra) {
  col.setRGB(
    spectra.r,
    spectra.g,
    spectra.b,
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
    updateSceneColors();
    e.preventDefault();
  }
}
