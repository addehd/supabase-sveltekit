import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let scene, camera, renderer;
let controls;

const scaleFactor = 108.2;
const fadeInDuration = 900;
const offsetDistance = 6;
const objectURL = '/apple.glb';

const initRum = async (el, data) => {

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  renderer = new THREE.WebGLRenderer({ canvas: el });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;

  // lights
  const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.2);
  directionalLight.position.set(-40, 50, 50);
  const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.2);
  scene.add(directionalLight);
  scene.add(ambientLight);

  // camera: x=0, y=10, z=100
  camera.position.set(0, 10, 100);

  // controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enableZoom = false;
  controls.enablePan = false;

  const loader = new GLTFLoader();

  loader.load(
    objectURL,
    function(gltf) {
  

      const boundingBox = new THREE.Box3().setFromObject(gltf.scene);
      const center = boundingBox.getCenter(new THREE.Vector3());
      gltf.scene.position.sub(center);

      gltf.scene.scale.multiplyScalar(scaleFactor);

      // calculate position in front of the player
      const direction = new THREE.Vector3();
      direction.y = 0; // keep it on the same horizontal plane
      direction.normalize();

      const pointLight = new THREE.PointLight(0xffffff, 1, 100);
      pointLight.position.set(0, 5, 0);
      gltf.scene.add(pointLight);

      // add model to scene
      scene.add(gltf.scene);

      // fade in animation
      const startTime = Date.now();

      function fadeIn() {
        const elapsedTime = Date.now() - startTime;
        const progress = Math.min(elapsedTime / fadeInDuration, 1);
        if (progress < 1) {
          requestAnimationFrame(fadeIn);
        }
      }

      fadeIn();
    }
  );

  // animation loop
  const animate = () => {
    requestAnimationFrame(animate);
    if (controls) controls.update();
    renderer.render(scene, camera);
  };
  animate();
}

export const createScene = async (el, imageUrl) => {
  await initRum(el, imageUrl);
};