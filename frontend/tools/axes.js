import * as THREE from '../../lib/three.module.js';
import { CSS2DRenderer, CSS2DObject } from '../../lib/CSS2DRenderer.js';

let renderer2;
let labelRenderer;
let camera2;
let scene2;


export function setup(frame) {
  if (typeof frame === 'string') frame = document.querySelector(frame);

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

export function update(mainCamera, controls) {
  camera2.up = mainCamera.up;
  camera2.position.copy(mainCamera.position);
  camera2.position.sub(controls.target);
  camera2.position.setLength(5);
  camera2.lookAt(scene2.position);
}

export function render() {
  renderer2.render(scene2, camera2);
  labelRenderer.render(scene2, camera2);
}
