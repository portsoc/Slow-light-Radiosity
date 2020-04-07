// Create the scene
var scene = new THREE.Scene();
scene.background = new THREE.Color(0x2d3436);
// Set up the camera
var camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);
// Set up the render
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);
// Create n random tetrahedrons
var n = Math.floor(Math.random() * 7) + 2;
var tetrahedrons = [];
var positions = [];
let x, y;
for (let i = 0; i < n; i++) {
    do {
        x = Math.floor(Math.random() * 10) - 5;
        y = Math.floor(Math.random() * 10) - 5;
    } while ([x, y] in positions);
    positions.push([x, y]);
    tetrahedrons.push(create_tetrahedron(x * 2.5, y * 2.5));
}
// Color one random tetrahedron in black and another in white
let i = Math.floor(Math.random() * tetrahedrons.length);
let i2;
do {
    i2 = Math.floor(Math.random() * tetrahedrons.length);
} while (i2 == i);
tetrahedrons[i].geometry.faces.forEach((face) => {
    face.color = new THREE.Color('black');
});
tetrahedrons[i2].geometry.faces.forEach((face) => {
    face.color = new THREE.Color('white');
});

camera.position.z = 15;

function animate() {
    requestAnimationFrame(animate);
    // Rotation
    tetrahedrons.forEach((tetrahedron) => {
        tetrahedron.rotation.x += 0.03;
        tetrahedron.rotation.y -= 0.03;
    });
    renderer.render(scene, camera);
}
animate();

function create_tetrahedron(x, y) {
    var geometry = new THREE.Geometry();
    geometry.colorsNeedUpdate = true;
    geometry.vertices.push(
        new THREE.Vector3(1, 1, 1),
        new THREE.Vector3(-1, -1, 1),
        new THREE.Vector3(-1, 1, -1),
        new THREE.Vector3(1, -1, -1),
    );
    // * To be pointing toward the outside of the cube
    // * they must be specified in a counter clockwise
    // * direction when that triangle is facing the camera
    geometry.faces.push(
        new THREE.Face3(0, 2, 1),
        new THREE.Face3(0, 3, 2),
        new THREE.Face3(0, 1, 3),
        new THREE.Face3(1, 2, 3),
    );
    // Set faces colors
    geometry.faces[0].color = new THREE.Color('red');
    geometry.faces[1].color = new THREE.Color('blue');
    geometry.faces[2].color = new THREE.Color('green');
    geometry.faces[3].color = new THREE.Color('yellow');
    // Set materials
    var material = new THREE.MeshBasicMaterial({
        color: 0x95a5a6,
        vertexColors: THREE.FaceColors
    });
    material.needsUpdate = true;
    var tetrahedron = new THREE.Mesh(geometry, material);
    tetrahedron.geometry.colorsNeedUpdate = true;
    // Add the tetrahedron to the scene
    scene.add(tetrahedron);
    tetrahedron.position.x = x;
    tetrahedron.position.y = y;
    return tetrahedron;
}