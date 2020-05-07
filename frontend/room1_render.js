import * as THREE from '../lib/three.module.js';
// import createRoom as createEnv from '../modeling/test-models/room1.js';
import { createTwoCubesInRoom as createEnv } from '../modeling/test-models/two-cubes.js';
import { OrbitControls } from '../lib/OrbitControls.js';
import * as Rad from '../radiosity/index.js';
import * as Modeling from '../modeling/index.js';

// * Three.js set up

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x2d3436);
const camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// * Room

const roomEnvironment = createEnv(2);

Modeling.coordinates.xyFloorToView(roomEnvironment);

for (const instance of roomEnvironment.instances) {
  const geometry = new THREE.Geometry();
  geometry.colorsNeedupdate = true;
  const vertices = instance.vertices;

  // * Read vertices
  for (const vertex of vertices) {
    geometry.vertices.push(new THREE.Vector3(
      vertex.pos.x,
      vertex.pos.y,
      vertex.pos.z,
    ));
  }
  vertices.forEach((v, i) => { v._orderIndex = i; });

  // * Read faces
  for (const surface of instance.surfaces) {
    let face;
    for (const patch of surface.patches) {
      for (const element of patch.elements) {
        face = new THREE.Face3(
          element.vertices[0]._orderIndex,
          element.vertices[1]._orderIndex,
          element.vertices[2]._orderIndex,
        );
        face.color.setRGB(
          surface.reflectance.r,
          surface.reflectance.g,
          surface.reflectance.b,
        );
        geometry.faces.push(face);
        if (element.isQuad) {
          face = new THREE.Face3(
            element.vertices[0]._orderIndex,
            element.vertices[2]._orderIndex,
            element.vertices[3]._orderIndex,
          );
          face.color.setRGB(
            surface.reflectance.r,
            surface.reflectance.g,
            surface.reflectance.b,
          );
          geometry.faces.push(face);
        }
      }
    }
  }

  // * Material

  const material = new THREE.MeshBasicMaterial({
    vertexColors: THREE.FaceColors,
    // wireframe: true,
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'w') material.wireframe = !material.wireframe;
  });

  // * Add to scene
  scene.add(new THREE.Mesh(geometry, material));
}

// * Controls

const controls = new OrbitControls(camera, renderer.domElement);

const bounds = roomEnvironment.boundingBox;
const roomCenter = new Rad.Point3(
  (bounds[0].x + bounds[1].x) / 2,
  (bounds[0].y + bounds[1].y) / 2,
  (bounds[0].z + bounds[1].z) / 2,
);

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

// * Animation

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
