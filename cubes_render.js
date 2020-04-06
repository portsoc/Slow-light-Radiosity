// Create the scene
var scene = new THREE.Scene();
scene.background = new THREE.Color(0x2d3436);
// Set up the camera
var camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);
// Set up the render
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
// Create cubes
const cubes = [
    create_cube(3),
    create_cube(-3),
];

camera.position.z = 5;

function animate() {
    requestAnimationFrame(animate);
    // Rotation
    cubes.forEach((cube) => {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
    });
    renderer.render(scene, camera);
}
animate();

function create_cube(x_position) {
    var geometry = new THREE.Geometry();
    geometry.vertices.push(
        new THREE.Vector3(-1, -1, 1),
        new THREE.Vector3(1, -1, 1),
        new THREE.Vector3(-1, 1, 1),
        new THREE.Vector3(1, 1, 1),
        new THREE.Vector3(-1, -1, -1),
        new THREE.Vector3(1, -1, -1),
        new THREE.Vector3(-1, 1, -1),
        new THREE.Vector3(1, 1, -1),
    );
    geometry.faces.push(
        // front
        new THREE.Face3(0, 3, 2),
        new THREE.Face3(0, 1, 3),
        // right
        new THREE.Face3(1, 7, 3),
        new THREE.Face3(1, 5, 7),
        // back
        new THREE.Face3(5, 6, 7),
        new THREE.Face3(5, 4, 6),
        // left
        new THREE.Face3(4, 2, 6),
        new THREE.Face3(4, 0, 2),
        // top
        new THREE.Face3(2, 7, 6),
        new THREE.Face3(2, 3, 7),
        // bottom
        new THREE.Face3(4, 1, 0),
        new THREE.Face3(4, 5, 1),
    );
    // Color one face
    geometry.faces[0].color = geometry.faces[1].color = new THREE.Color('magenta');
    // Set materials
    var material = new THREE.MeshBasicMaterial({
        vertexColors: THREE.FaceColors,
        color: 0x95a5a6
    });
    var cube = new THREE.Mesh(geometry, material);
    // Add the cube to the scene
    scene.add(cube);
    cube.position.x = x_position;
    return cube;
}