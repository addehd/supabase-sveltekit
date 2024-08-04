import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js';
import { PointerLockControls } from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/PointerLockControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(105, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const materials = [
  new THREE.MeshBasicMaterial({ color: 0xff0000 }),
  new THREE.MeshBasicMaterial({ color: 0x00ff00 }),
  new THREE.MeshBasicMaterial({ color: 0x0000ff }),
  new THREE.MeshBasicMaterial({ color: 0xffff00 }),
  new THREE.MeshBasicMaterial({ color: 0x00ffff }),
  new THREE.MeshBasicMaterial({ color: 0xff00ff })
];
const cube = new THREE.Mesh(geometry, materials);
scene.add(cube);

const floorGeometry = new THREE.PlaneGeometry(500, 500, 1, 1);
const floorMaterial = new THREE.MeshPhongMaterial({ color: 0x808080, side: THREE.DoubleSide });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -1.5;
scene.add(floor);

const ambientLight = new THREE.AmbientLight(0x404040); 
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0x00ffff, 1.0);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

camera.position.z = 9;
camera.position.y = 3;

const controls = new PointerLockControls(camera, document.body);
const blocker = document.getElementById('blocker');
const instructions = document.getElementById('instructions');

instructions.addEventListener('click', () => {
  controls.lock();
}, false);

controls.addEventListener('lock', () => {
  instructions.style.display = 'none';
  blocker.style.display = 'none';
});

controls.addEventListener('unlock', () => {
  blocker.style.display = 'block';
  instructions.style.display = '';
});

document.body.appendChild(controls.getObject());

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;

const onKeyDown = function (event) {
  switch (event.code) {
    case 'ArrowUp':
    case 'KeyW':
      moveForward = true;
      break;
    case 'ArrowLeft':
    case 'KeyA':
      moveLeft = true;
      break;
    case 'ArrowDown':
    case 'KeyS':
      moveBackward = true;
      break;
    case 'ArrowRight':
    case 'KeyD':
      moveRight = true;
      break;
  }
};

const onKeyUp = function (event) {
  switch (event.code) {
    case 'ArrowUp':
    case 'KeyW':
      moveForward = false;
      break;
    case 'ArrowLeft':
    case 'KeyA':
      moveLeft = false;
      break;
    case 'ArrowDown':
    case 'KeyS':
      moveBackward = false;
      break;
    case 'ArrowRight':
    case 'KeyD':
      moveRight = false;
      break;
  }
};

document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);

function animate() {
  requestAnimationFrame(animate);

  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  if (controls.isLocked === true) {
    const delta = 0.1;

    if (moveForward) controls.moveForward(delta);
    if (moveBackward) controls.moveBackward(delta);
    if (moveLeft) controls.moveLeft(delta);
    if (moveRight) controls.moveRight(delta);
  }

  renderer.render(scene, camera);
}

animate();
