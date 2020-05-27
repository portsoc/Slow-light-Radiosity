import * as THREE from '../../lib/three.module.js';
import { CSS2DRenderer, CSS2DObject } from '../../lib/CSS2DRenderer.js';

let renderer;
let labelRenderer;
let camera;
let scene;

export function setup() {
  const frame = document.createElement('div');
  frame.classList.add('axes-frame');
  document.body.append(frame);

  // renderer
  renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(frame.clientWidth, frame.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0x000000, 0);
  frame.appendChild(renderer.domElement);

  // scene
  scene = new THREE.Scene();
  const root = new THREE.Group();
  scene.add(root);

  // label
  labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(frame.clientWidth, frame.clientHeight);
  labelRenderer.domElement.style.position = 'absolute';
  labelRenderer.domElement.style.top = '0px';
  frame.appendChild(labelRenderer.domElement);

  // axes in Radiosity Environment coordinate system
  root.add(createAxis(1, 0, 0, 'X', '#f33'));
  root.add(createAxis(0, 0, -1, 'Y', '#3f3'));
  root.add(createAxis(0, 1, 0, 'Z', '#44f'));

  // camera
  camera = new THREE.PerspectiveCamera(50, frame.clientWidth / frame.clientHeight, 1, 1000);
  camera.position.set(2, 2, 2);
  camera.lookAt(0, 0, 0);
  root.add(camera);
}

function createAxis(x, y, z, label, color) {
  // line
  const material = new THREE.LineBasicMaterial({ color: new THREE.Color(color) });
  const points = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(x, y, z),
  ];
  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  const line = new THREE.Line(geometry, material);

  const textEl = document.createElement('div');
  textEl.textContent = label;
  textEl.style.color = color;

  // distance the label from the axis a bit
  const d = 1.2;
  const labelObj = new CSS2DObject(textEl);
  labelObj.position.set(x * d, y * d, z * d);
  line.add(labelObj);

  return line;
}

export function update(mainCamera, target) {
  camera.up = mainCamera.up;
  camera.position.copy(mainCamera.position);
  camera.position.sub(target);
  camera.position.setLength(3.33);
  camera.lookAt(0, 0, 0);
}

export function render() {
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}
