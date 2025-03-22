import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
export function loadSmileyFace(vg, player, room) {
  const loader = new GLTFLoader();
  loader.load(
    '/smiley.glb',
    function(gltf) {
      const material = new THREE.MeshStandardMaterial({
        color: 0xFFE500,
        emissive: 0x444400,  // gloaaaaaa
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
      const scaleFactor = 7.2;
      gltf.scene.scale.multiplyScalar(scaleFactor);
      // get player position
      const playerPos = player.object.position.clone();
      
      // get camera direction
      const cameraDirection = new THREE.Vector3();
      vg.camera.getWorldDirection(cameraDirection);
      cameraDirection.y = 0;
      cameraDirection.normalize();
      
      // calculate right vector (perpendicular to camera direction)
      const rightVector = new THREE.Vector3();
      rightVector.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0));
      rightVector.normalize();
      
      // position smiley to the right side of player's view
      const forwardDistance = 7;  // how far forward
      const sideDistance = 6;     // how far to the side
      
      // set initial position to the side
      gltf.scene.position.copy(playerPos.clone()
        .add(cameraDirection.clone().multiplyScalar(forwardDistance))
        .add(rightVector.clone().multiplyScalar(sideDistance)));
      // ensure it doesn't overlap with walls and position it higher
      gltf.scene.position.x = Math.max(-room.width / 2 + 1, Math.min(room.width / 2 - 1, gltf.scene.position.x));
      gltf.scene.position.y = playerPos.y + 1; // raise the smiley face
      gltf.scene.position.z = Math.max(-room.depth / 2 + 1, Math.min(room.depth / 2 - 1, gltf.scene.position.z));
      // rotate smiley towards player
      playerPos.y = gltf.scene.position.y;
      gltf.scene.lookAt(playerPos);
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
          // get player position
          const playerPos = player.object.position.clone();
          
          // get camera direction
          const cameraDirection = new THREE.Vector3();
          vg.camera.getWorldDirection(cameraDirection);
          cameraDirection.y = 0;
          cameraDirection.normalize();
          
          // calculate right vector (perpendicular to camera direction)
          const rightVector = new THREE.Vector3();
          rightVector.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0));
          rightVector.normalize();
          
          // position smiley to the right side of player's view
          const forwardDistance = 7;  // how far forward
          const sideDistance = 6;     // how far to the side
          
          // combine forward and right vectors to get position
          const targetPosition = playerPos.clone()
            .add(cameraDirection.clone().multiplyScalar(forwardDistance))
            .add(rightVector.clone().multiplyScalar(sideDistance));
          
          // smoothly move toward target position
          const lerpFactor = 0.03; // adjust for faster/slower following
          gltf.scene.position.lerp(targetPosition, lerpFactor);
          
          // ensure it doesn't go outside room boundaries
          gltf.scene.position.x = Math.max(-room.width / 2 + 1, Math.min(room.width / 2 - 1, gltf.scene.position.x));
          gltf.scene.position.y = playerPos.y + 1; // maintain height above ground
          gltf.scene.position.z = Math.max(-room.depth / 2 + 1, Math.min(room.depth / 2 - 1, gltf.scene.position.z));
          
          // make smiley face the player
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

export function removeSmileyFace(vg) {
  console.log('removeSmileyFace');
  
  // find the smiley object directly
  const smiley = vg.things.find(thing => thing.name === 'smiley');
  
  // check if smiley exists
  if (!smiley) {
    console.warn('Smiley not found for removal');
    return;
  }
  
  // find material - traverse the scene to get the mesh material
  let material = null;
  
  smiley.object.traverse(function(child) {
    if (child.isMesh && child.material) {
      material = child.material;
    }
  });
  
  // if no material found, try the first child as fallback
  if (!material && smiley.object.children[0]?.material) {
    material = smiley.object.children[0].material;
  }
  
  // fade out animation if material exists and is transparent
  if (material && material.transparent) {
    const fadeOutDuration = 900;
    const startTime = Date.now();
    
    function fadeOut() {
      const elapsedTime = Date.now() - startTime;
      const progress = Math.min(elapsedTime / fadeOutDuration, 1);
      material.opacity = 1 - progress;
      
      if (progress < 1) {
        requestAnimationFrame(fadeOut);
      } else {
        // remove after fade completes
        vg.remove(smiley);
      }
    }
    
    fadeOut();
  } else {
    // remove immediately if no material or not transparent
    console.log('Removing smiley immediately (no material or not transparent)');
    vg.remove(smiley);
  }
}