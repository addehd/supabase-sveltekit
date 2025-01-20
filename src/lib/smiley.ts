import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function loadSmileyFace(vg, player, room) {
  const loader = new GLTFLoader();

  loader.load(
    '/smiley.glb',
    function(gltf) {
      const material = new THREE.MeshStandardMaterial({
        color: 0xffff00,
        emissive: 0x444400,  // glow
        roughness: 1,
        metalness: 0.5,
        transparent: true,
        opacity: 0,
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

      // calculate position in front of the player
      const offsetDistance = 6; // distance in front of the player
      const direction = new THREE.Vector3();
      vg.camera.getWorldDirection(direction);
      direction.y = 0; // keep it on the same horizontal plane
      direction.normalize();

      // set position in front of the player
      gltf.scene.position.copy(player.object.position).add(direction.multiplyScalar(offsetDistance));

      // ensure it doesn't overlap with walls and position it higher
      gltf.scene.position.x = Math.max(-room.width / 2 + 1, Math.min(room.width / 2 - 1, gltf.scene.position.x));
      gltf.scene.position.y += 1; // raise the smiley face by 2 units
      gltf.scene.position.z = Math.max(-room.depth / 2 + 1, Math.min(room.depth / 2 - 1, gltf.scene.position.z));

      // rotate smiley towards player
      const playerPosition = player.object.position.clone();
      playerPosition.y = gltf.scene.position.y;
      gltf.scene.lookAt(playerPosition);

      const pointLight = new THREE.PointLight(0xffffff, 1, 100);
      pointLight.position.set(0, 5, 0);
      gltf.scene.add(pointLight);

      // fade in animation
      const fadeInDuration = 900;
      const startTime = Date.now();

      function fadeIn() {
        const elapsedTime = Date.now() - startTime;
        const progress = Math.min(elapsedTime / fadeInDuration, 1);
        material.opacity = progress;

        if (progress < 1) {
          requestAnimationFrame(fadeIn);
        }
      }

      fadeIn();

      vg.add({
        name: 'smiley',
        object: gltf.scene,
        update: () => {
          // update smiley rotation to face player
          const playerPos = player.object.position.clone();
          playerPos.y = gltf.scene.position.y;
          gltf.scene.lookAt(playerPos);
        },
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
