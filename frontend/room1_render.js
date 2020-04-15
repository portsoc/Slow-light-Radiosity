import * as THREE from '../lib/three.module.js';
import createRoom from '../modeling/test-models/room1.js';
import { OrbitControls } from '../lib/OrbitControls.js';
import { Point3 } from '../radiosity/index.js';

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

const roomEnvironement = createRoom(1);

for (const instance of roomEnvironement.instances) {
  const geometry = new THREE.Geometry();
  geometry.colorsNeedupdate = true;
  const vertices = instance.vertices;

  // * Read vertices
  for (const vertex of vertices) {
    geometry.vertices.push(new THREE.Vector3(
      vertex.pos.x,
      vertex.pos.z,
      -vertex.pos.y,
    ));
  }
  vertices.forEach((v, i) => { v._orderIndex = i; });

  // * Read faces
  for (const surface of instance.surfaces) {
    let face;
    for (const patch of surface.patches) {
      face = new THREE.Face3(
        patch.vertices[0]._orderIndex,
        patch.vertices[1]._orderIndex,
        patch.vertices[2]._orderIndex,
      );
      face.color.setRGB(
        surface.reflectance.r,
        surface.reflectance.g,
        surface.reflectance.b,
      );
      geometry.faces.push(face);
      if (patch.isQuad) {
        face = new THREE.Face3(
          patch.vertices[0]._orderIndex,
          patch.vertices[2]._orderIndex,
          patch.vertices[3]._orderIndex,
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

  // * Material

  const material = new THREE.MeshBasicMaterial({
    vertexColors: THREE.FaceColors,
  });

  // * Add to scene
  scene.add(new THREE.Mesh(geometry, material));
}

// * Controls

const controls = new OrbitControls(camera, renderer.domElement);

const bounds = roomEnvironement.boundingBox;
const roomCenter = new Point3(
  (bounds[0].x + bounds[1].x) / 2,
  (bounds[0].y + bounds[1].y) / 2,
  (bounds[0].z + bounds[1].z) / 2,
);

controls.target = new THREE.Vector3(roomCenter.x, roomCenter.y, roomCenter.z);
controls.enablePan = false;
controls.update();

// * Animation

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
