/* global THREE */
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, 1, 1, 1000);
camera.position.set(0, 0, 10);
const renderer = new THREE.WebGLRenderer({
  antialias: true,
});
const canvas = renderer.domElement;
document.body.appendChild(canvas);


const geom = new THREE.TorusKnotGeometry(2.5, 0.5, 32, 8);

const cols = [{
  stop: 0,
  color: new THREE.Color(0xf7b000),
}, {
  stop: 0.25,
  color: new THREE.Color(0xdd0080),
}, {
  stop: 0.5,
  color: new THREE.Color(0x622b85),
}, {
  stop: 0.75,
  color: new THREE.Color(0x007dae),
}, {
  stop: 1,
  color: new THREE.Color(0x77c8db),
}];

setGradient(geom, cols, 'z');

function setGradient(geometry, colors, axis) {
  geometry.computeBoundingBox();

  const bbox = geometry.boundingBox;
  const size = new THREE.Vector3().subVectors(bbox.max, bbox.min);

  const vertexIndices = ['a', 'b', 'c'];
  let face; let vertex; const normalized = new THREE.Vector3();
  let normalizedAxis = 0;

  for (let c = 0; c < colors.length - 1; c++) {
    const colorDiff = colors[c + 1].stop - colors[c].stop;

    for (let i = 0; i < geometry.faces.length; i++) {
      face = geometry.faces[i];
      for (let v = 0; v < 3; v++) {
        vertex = geometry.vertices[face[vertexIndices[v]]];
        normalizedAxis = normalized.subVectors(vertex, bbox.min).divide(size)[axis];
        if (normalizedAxis >= colors[c].stop && normalizedAxis <= colors[c + 1].stop) {
          const localNormalizedAxis = (normalizedAxis - colors[c].stop) / colorDiff;
          face.vertexColors[v] = colors[c].color.clone().lerp(colors[c + 1].color, localNormalizedAxis);
          // face.color = colors[c].color.clone().lerp(colors[c + 1].color, localNormalizedAxis);
        }
      }
    }
  }
}

const mat = new THREE.MeshBasicMaterial({
  vertexColors: THREE.VertexColors,
  wireframe: false,
});
const obj = new THREE.Mesh(geom, mat);
scene.add(obj);


render();

function resize(renderer) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(window.devicePixelRatio);
  }
  return needResize;
}

function render() {
  if (resize(renderer)) {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }
  renderer.render(scene, camera);
  obj.rotation.y += 0.01;
  requestAnimationFrame(render);
}
