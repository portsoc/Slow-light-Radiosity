import * as THREE from '../lib/three.module.js';
import createRoom from '../modeling/test-models/room1.js';

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
const material = new THREE.MeshBasicMaterial({
  color: 0x95a5a6,
});

const roomEnvironement = createRoom(1);

for (const instance of roomEnvironement.instances) {
  const geometry = new THREE.Geometry();
  const vertices = instance.vertices;

  console.log('vertices');

  // * Read vertices
  for (const vertex of vertices) {
    geometry.vertices.push(new THREE.Vector3(
      vertex.pos.x,
      vertex.pos.z,
      -vertex.pos.y,
    ));
  }
  vertices.forEach((v, i) => { v._orderIndex = i; });

  console.log('faces');

  // * Read faces
  for (const surface of instance.surfaces) {
    for (const patch of surface.patches) {
      geometry.faces.push(new THREE.Face3(
        patch.vertices[0]._orderIndex,
        patch.vertices[1]._orderIndex,
        patch.vertices[2]._orderIndex,
      ));
      if (patch.isQuad) {
        geometry.faces.push(new THREE.Face3(
          patch.vertices[0]._orderIndex,
          patch.vertices[2]._orderIndex,
          patch.vertices[3]._orderIndex,
        ));
      }
    }
  }

  console.log(geometry.vertices);
  console.log(geometry.faces);


  console.log('scene');

  // * Add to scene
  scene.add(new THREE.Mesh(geometry, material));
}

// * Animation

function animate() {
  // requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
