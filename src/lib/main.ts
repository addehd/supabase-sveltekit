import * as CANNON from 'cannon-es'
import * as THREE from 'three'
import VG from './vg'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { setupFloor } from './floor';
import { setupArtwork } from './art-canvas';
import { loadSmileyFace } from './smiley';
import { setupViracocha } from './viracocha';
import { setupVideo } from './video-cube';
import { setupMobileControls } from './mobile-controls';
import { removeSmileyFace } from './smiley';
import { setupPlayer } from './player';
import { setupRoom } from './room';

let vg;
let player;
let videoCleanup;

declare global {
  interface Window {
    CANNON: typeof CANNON;
    THREE: typeof THREE;
    VG: typeof VG;
  }
}

const room = {
  width: 34 * 3.3,
  depth: 107 * 3.99,
  height: 4 * 1.5,
  opacity: 0.8,
  thickness: 1
}

const initRum = (el, data) => {
  window.CANNON = CANNON;
  window.THREE = THREE;
  window.VG = VG;

  vg = new VG(window, el);
  vg.run();

  const renderer = new THREE.WebGLRenderer({ canvas: el });
  renderer.setSize(window.innerWidth, window.innerHeight);
  vg.renderer = renderer;

  const textureLoader = new THREE.TextureLoader();

  const ground = setupFloor(room );
  vg.add(ground);

  { // general
    vg.input.onDown['c'] = (key) => { vg.gui.show(vg.gui._hidden) }
    vg.input.onDown['h'] = (key) => { vg.hudEnabled = !vg.hudEnabled }
  }

  { // world
    vg.add({
      name: 'world',
      unremovable: true,
    })
  }

  { // settings
    var settings = {
      name: 'settings',
      unremovable: true,
      // gui: []
    }

    vg.add(settings)
  }

  { // camera
    vg.add({
      name: 'camera',
      unremovable: true,
    })
  }

  { // player
    const checkArtworkProximity = setupArtwork(vg, textureLoader, data, room);

    player = setupPlayer(vg, {
      position: {
        x: -room.width * 0.3,
        y: 1.5,
        z: -room.depth * 0.46
      },
      look: {
        x: 0.31,
        y: -0.3
      },
      room: {
        width: room.width,
        depth: room.depth
      },
      onUpdate: (position) => checkArtworkProximity(position)
    });

    setupMobileControls(vg, player);
  }

  { // room
    setupRoom(vg, {
      width: room.width,
      depth: room.depth,
      height: room.height * 9,
      thickness: room.thickness,
      opacity: room.opacity
    }, textureLoader);
  }

  { // hangar
    const loader = new GLTFLoader();

    loader.load(
      '/hangar.glb',
      function(gltf) {
        const material = new THREE.MeshStandardMaterial({
          color: 0xC0C0C0,
          roughness: 0.7,
          metalness: 1
        });
    
        gltf.scene.traverse(function(child) {
          if (child.isMesh) {
            child.material = material;
          }
        });
    
        // fit the room
        const roomWidth = room.width;
        const roomDepth = room.depth;
        const roomHeight = room.height;
    
        const boundingBox = new THREE.Box3().setFromObject(gltf.scene);
        const hangarWidth = boundingBox.max.x - boundingBox.min.x;
        const hangarDepth = boundingBox.max.z - boundingBox.min.z;
        const hangarHeight = boundingBox.max.y - boundingBox.min.y;
    
        const scaleX = (roomWidth / hangarWidth) * 1.2;
        const scaleY = roomHeight / hangarHeight;
        const scaleZ = roomDepth / hangarDepth;
    
        const scale = Math.min(scaleY, scaleZ) * 6.8;
    
        for (let i = 0; i < 3; i++) {
          const hangarClone = gltf.scene.clone();
          hangarClone.scale.set(scale * 1.2, scale, scale);
          
          const zOffset = (i - 1) * roomDepth / 3;
          hangarClone.position.set(0, 2, zOffset);
    
          vg.add({
            name: `hangar_${i + 1}`,
            object: hangarClone,
          });
        }
      },
      undefined,
      function (error) {
        console.error('Error loading GLTF file', error);
        alert('Failed to load the 3D model. Please check the path or file.');
      }
    );
  }

  setupArtwork(vg, textureLoader, data, room);
  setupViracocha(vg, room);
  setupVideo(room, vg);
}

export const createScene = (el, imageUrl) => {
  initRum(el, imageUrl);
};

export const loadSmileyFaceWrapper = () => {
  const existingSmiley = vg.things.find(thing => thing.name === 'smiley');
  if (!existingSmiley) {
    loadSmileyFace(vg, player, room);
  } else {
    console.log('smiley already exists, not creating a new one');
  }
}

export const removeSmileyFaceWrapper = () => {
  console.log('removeSmileyFaceWrapper');
  removeSmileyFace(vg);
}