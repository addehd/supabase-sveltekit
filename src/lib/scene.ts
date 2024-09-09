import {
  BoxGeometry,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  Shape,
  TextureLoader,
  WebGLRenderer,
  ExtrudeGeometry
} from 'three';

let scene: Scene;
let camera: PerspectiveCamera;
let renderer: WebGLRenderer;

const initScene = () => {
  scene = new Scene();
  camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;
};

const addRoundedRectangle = () => {
  const shape = new Shape();

  shape.moveTo(-1, 1);
  shape.lineTo(1, 1);
  shape.lineTo(1, -0.5);
  shape.quadraticCurveTo(1, -1, 0.5, -1);
  shape.quadraticCurveTo(-1, -1, -1, -0.5);
  shape.lineTo(-1, 1);

  const extrudeSettings = {
    depth: 5,
    bevelEnabled: false,
  };

  const geometry = new ExtrudeGeometry(shape, extrudeSettings);
  const material = new MeshBasicMaterial({ color: 0x00ff00 });
  const mesh = new Mesh(geometry, material);

  scene.add(mesh);
};

const animate = () => {
  requestAnimationFrame(animate);
  scene.children.forEach(object => {
    if (object instanceof Mesh) {
      object.rotation.x += 0.01;
      object.rotation.y += 0.01;
    }
  });
  renderer.render(scene, camera);
};

const resize = () => {
  if (renderer) {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }
};

export const exportScene = () => {
  const sceneJSON = scene.toJSON();
  const jsonStr = JSON.stringify(sceneJSON);
  const blob = new Blob([jsonStr], { type: 'application/json' });

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'scene.json';
  link.click();
};

export const createScene = (el: HTMLCanvasElement, imageUrl: string) => {
  if (typeof window !== 'undefined') {
    initScene();
    renderer = new WebGLRenderer({ antialias: true, canvas: el });
    resize();
    animate();
    addRoundedRectangle();
    window.addEventListener('resize', resize);
  } else {
    console.error("createScene should only be called in a browser environment");
  }
};