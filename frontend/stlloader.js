import * as THREE from '../lib/three.module.js';
import { STLLoader } from '../lib/STLLoader.js';
import { OrbitControls } from '../lib/OrbitControls.js';

let container;

let camera, cameraTarget, scene, renderer, controls;

init();
animate();

function init() {
  container = document.createElement('div');
  document.body.appendChild(container);

  camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 100);
  camera.position.set(3, 0.15, 3);

  cameraTarget = new THREE.Vector3(0, 0, 0);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x72645b);

  // Binary file

  const loader = new STLLoader();
  const material = new THREE.MeshPhongMaterial({ color: 0xff5533, specular: 0x111111, shininess: 200 });

  loader.load('../modeling/stl-models/The_Tinker_Dragon_Rises.stl', function (geometry) {
    const mesh = new THREE.Mesh(geometry, material);

    mesh.rotation.set(-Math.PI / 2, 0, 0);
    mesh.scale.set(0.02, 0.02, 0.02);

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    scene.add(mesh);
  });

  // Lights

  scene.add(new THREE.HemisphereLight(0x443333, 0x111122));

  // renderer

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;

  renderer.shadowMap.enabled = true;

  container.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
}

function animate() {
  requestAnimationFrame(animate);

  render();
  controls.update();
}

function render() {
  camera.lookAt(cameraTarget);
  renderer.render(scene, camera);
}
