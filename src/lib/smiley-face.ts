import * as CANNON from 'cannon-es'
import * as THREE from 'three'
import VG from './vg'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

const smileyn = {
  color: 0xFFFF00,
  roughness: 0.3,
  metalness: 0.2,
  scale: 10,
  position: { x: 0, y: 30, z: 0 }
};

export const loadSmileyFace = (vg: VG) => {
  const geometry = new THREE.SphereGeometry(5, 32, 32);
  const material = new THREE.MeshStandardMaterial({
    color: smileyn.color,
    roughness: smileyn.roughness,
    metalness: smileyn.metalness
  });
  const smileyFace = new THREE.Mesh(geometry, material);

  smileyFace.scale.set(smileyn.scale, smileyn.scale, smileyn.scale);
  smileyFace.position.set(
    smileyn.position.x,
    smileyn.position.y,
    smileyn.position.z
  );

  // Add eyes
  const eyeGeometry = new THREE.SphereGeometry(0.5, 16, 16);
  const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  leftEye.position.set(-2, 2, 4.5);
  rightEye.position.set(2, 2, 4.5);
  smileyFace.add(leftEye);
  smileyFace.add(rightEye);

  // Add smile
  const smileGeometry = new THREE.TorusGeometry(3, 0.5, 16, 100, Math.PI);
  const smileMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const smile = new THREE.Mesh(smileGeometry, smileMaterial);
  smile.position.set(0, -1, 4.5);
  smile.rotation.x = Math.PI;
  smileyFace.add(smile);

  vg.add({
    name: 'smileyFace',
    object: smileyFace,
    gui: [
      [smileyFace.position, 'x', -50, 50, 1, 'position x'],
      [smileyFace.position, 'y', 0, 100, 1, 'position y'],
      [smileyFace.position, 'z', -50, 50, 1, 'position z'],
      [smileyFace.scale, 'x', 1, 20, 0.1, 'scale'],
      [smileyFace.scale, 'y', 1, 20, 0.1, 'scale'],
      [smileyFace.scale, 'z', 1, 20, 0.1, 'scale'],
      [material, 'color', 'color'],
      [material, 'roughness', 0, 1, 0.01, 'roughness'],
      [material, 'metalness', 0, 1, 0.01, 'metalness'],
      [smileyFace.rotation, 'y', -Math.PI, Math.PI, 0.01, 'rotation y']
    ]
  });
};
