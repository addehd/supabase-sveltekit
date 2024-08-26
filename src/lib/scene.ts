import {
  BoxGeometry,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  TextureLoader,
  WebGLRenderer,
} from 'three';

let scene: Scene;
let camera: PerspectiveCamera;
let renderer: WebGLRenderer;

const initScene = () => {
  scene = new Scene();

  camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;
};

const addCubeWithSingleTexture = (imageUrl: string) => {
  const textureLoader = new TextureLoader();
  const texture = textureLoader.load(imageUrl);

  const materials = new MeshBasicMaterial({ map: texture });

  const geometry = new BoxGeometry(2, 2, 2);
  const cube = new Mesh(geometry, materials);

  scene.add(cube);
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

export const createScene = (el: HTMLCanvasElement, imageUrl) => {
  if (typeof window !== 'undefined') {
    initScene();
    renderer = new WebGLRenderer({ antialias: true, canvas: el });
    resize();
    animate();

    addCubeWithSingleTexture(imageUrl);

    window.addEventListener('resize', resize);
  } else {
    console.error("createScene should only be called in a browser environment");
  }
};