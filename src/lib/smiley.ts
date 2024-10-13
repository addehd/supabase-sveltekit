import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function loadSmileyFace(vg) {
  const loader = new GLTFLoader();

  loader.load(
    '/smiley.glb',
    function(gltf) {

      const material = new THREE.MeshStandardMaterial({
        color: 0xffff00,
        emissive: 0x444400,  // glow
        roughness: 1,
        metalness: 0.5,
      });
  
      gltf.scene.traverse(function(child) {
        if (child.isMesh) {
          child.material = material;
        }
      });

      const boundingBox = new THREE.Box3().setFromObject(gltf.scene);
      const center = boundingBox.getCenter(new THREE.Vector3());
      gltf.scene.position.sub(center);

      const scaleFactor = 8.2;
      gltf.scene.scale.multiplyScalar(scaleFactor);

      gltf.scene.position.set(-11, 1, -170);

      // Changed rotation to face more to the right
      gltf.scene.rotation.y = -Math.PI / 4;

      const pointLight = new THREE.PointLight(0xffffff, 1, 100);
      pointLight.position.set(0, 5, 0);
      gltf.scene.add(pointLight);

      vg.add({
        name: 'smiley',
        object: gltf.scene,
        gui: [
          [gltf.scene.position, 'x', -50, 50, 0.1, 'position x'],
          [gltf.scene.position, 'y', -50, 50, 0.1, 'position y'],
          [gltf.scene.position, 'z', -50, 50, 0.1, 'position z'],
          [gltf.scene.scale, 'x', 0.1, 5, 0.01, 'scale x'],
          [gltf.scene.scale, 'y', 0.1, 5, 0.01, 'scale y'],
          [gltf.scene.scale, 'z', 0.1, 5, 0.01, 'scale z'],
          [gltf.scene.rotation, 'y', -Math.PI, Math.PI, 0.01, 'rotation y'],
          [material, 'roughness', 0, 1, 0.01, 'roughness'],
          [material, 'metalness', 0, 1, 0.01, 'metalness'],
          [pointLight, 'intensity', 0, 2, 0.1, 'light intensity']
        ]
      });
    },
    undefined,
    function(error) {
      console.error('Error loading GLTF file', error);
      alert('Failed to load the 3D model. Please check the path or file.');
    }
  );
}
