import * as CANNON from 'cannon-es'
import * as THREE from 'three'
import VG from './vg'
import { setupFloor } from './floor';
import { setupArtwork } from './art-canvas';
import { loadSmileyFace, removeSmileyFace } from './smiley';
import { setupBirds } from './birds';
import { setupGrass } from './grass';
import { setupMark } from './mark';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { setupMobileControls } from './mobile-controls';
import { setupPlayer } from './player';
import { setupRoom } from './room';
let vg;
let player;

const room = {
  width: 64 * 2,
  depth: 107 * 2,
  height: 4 * 1.5,
  thickness: 1,
  wallHeight: 36,
  player: {
    x: -(64 ) * 0.3,
    y: 1.5,
    z: -(107 ) * 0.46,
    look: {
      x: 0,    // rotation up/down
      y: -0.3     // rotation left/right
    }
  }
}

const markMatrix = [
  [0, 0, 0],
  [0, 1, 0],
  [0, 0, 0]
];

const initRum = (el, data) => {
  console.log('initRum called with canvas:', el);
  vg = new VG(window, el);
  vg.run();

  const renderer = new THREE.WebGLRenderer({ canvas: el });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;

  // check if vr is supported before showing button
  if (navigator.xr) {
    navigator.xr.isSessionSupported('immersive-vr').then(supported => {
      if (supported) {
        const vrButton = VRButton.createButton(renderer);
        document.body.appendChild(vrButton);
      }
    });
  }
  
  vg.renderer = renderer;

  const textureLoader = new THREE.TextureLoader();
  const matrix = [
    [0, 0, 0],
    [0, 1, 0], // x in middle
    [0, 0, 0]
  ];

  const ground = setupFloor(room);
  vg.add(ground);
  //vg.gui.show(vg.gui._hidden);

  { // general
    vg.input.onDown['c'] = (key) => { vg.gui.show(vg.gui._hidden) }
    vg.input.onDown['h'] = (key) => { vg.hudEnabled = !vg.hudEnabled }
  }

  { // world
    vg.add({
      name: 'world',
      unremovable: true,
      // gui: [
      //   [ vg.world.gravity, 'y', -100, 10, 0.1, 'gravity' ]
      // ]
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
    const checkPlayerAboveMark = setupMark(vg, room, markMatrix, player);

    player = setupPlayer(vg, {
      position: {
        x: room.player.x,
        y: room.player.y,
        z: room.player.z
      },
      look: {
        x: room.player.look.x,
        y: room.player.look.y
      },
      room: {
        width: room.width,
        depth: room.depth
      },
      onUpdate: (position) => {
        // check mark position every frame
        checkPlayerAboveMark(position);
      }
    });

    setupMobileControls(vg, player);
  }

  { // room
    setupRoom(vg, {
      width: room.width,
      depth: room.depth,
      height: room.height,
      thickness: room.thickness,
      wallHeight: room.wallHeight
    }, textureLoader);
  }
 
  { // skybox
    const loader = new THREE.CubeTextureLoader();
    const skyboxTexture = loader.load([
      '/skybox/Daylight_Box_Right.jpg',   // positive x (px)
      '/skybox/Daylight_Box_Left.jpg',    // negative x (nx)
      '/skybox/Daylight_Box_Top.jpg',     // positive y (py)
      '/skybox/Daylight_Box_Bottom.jpg',  // negative y (ny)
      '/skybox/Daylight_Box_Front.jpg',   // positive z (pz)
      '/skybox/Daylight_Box_Back.jpg'     // negative z (nz)
    ]);

    const skyboxTextureNight = loader.load([
      '/skybox-night/Daylight_Box_Right.jpg',   // positive x (px)
      '/skybox-night/Daylight_Box_Left.jpg',    // negative x (nx)
      '/skybox-night/Daylight_Box_Top.jpg',     // positive y (py)
      '/skybox-night/Daylight_Box_Bottom.jpg',  // negative y (ny)
      '/skybox-night/Daylight_Box_Front.jpg',   // positive z (pz)
      '/skybox-night/Daylight_Box_Back.jpg'     // negative z (nz)
    ]);

    // add night mode toggle with css filter
    let isDay = true;
    const canvas = vg.renderer.domElement;
    
    // create day/night toggle button
    const toggleButton = document.createElement('button');
    toggleButton.textContent = '🌙';
    toggleButton.style.position = 'absolute';
    toggleButton.style.bottom = '20px';
    toggleButton.style.left = '50%';
    toggleButton.style.transform = 'translateX(-50%)';
    toggleButton.style.width = '50px';
    toggleButton.style.height = '50px';
    toggleButton.style.borderRadius = '50%';
    toggleButton.style.fontSize = '24px';
    toggleButton.style.color = 'white';
    toggleButton.style.border = '2px solid white';
    toggleButton.style.cursor = 'pointer';
    toggleButton.style.zIndex = '1000';
    toggleButton.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    
    // add button to document body, positioned relative to canvas
    canvas.parentElement.style.position = 'relative';
    canvas.parentElement.appendChild(toggleButton);
    
    // set initial skybox
    vg.scene.background = skyboxTexture;
    
    // toggle function for day/night
    const toggleDayNight = () => {
      isDay = !isDay;
      if (!isDay) {
        // night mode
        toggleButton.textContent = '☀️';
        
        // change skybox to night version
        vg.scene.background = skyboxTextureNight;
        
        // darken all textures by adjusting material colors
        vg.scene.traverse((obj) => {
          if (obj.material && obj.material.color) {
            // store original color if not already stored
            if (!obj.userData.originalColor) {
              obj.userData.originalColor = obj.material.color.clone();
            }
            // darken the color
            obj.material.color.multiplyScalar(0.3);
          }
        });
        
        // also darken ambient light
        vg.scene.traverse((obj) => {
          if (obj.type === 'AmbientLight') {
            obj.intensity = 0.1;
          }
          if (obj.type === 'DirectionalLight') {
            obj.intensity = 0.1;
          }
        });
      } else {
        // day mode
        toggleButton.textContent = '🌙';
        
        // change skybox to day version
        vg.scene.background = skyboxTexture;
        
        // restore original colors
        vg.scene.traverse((obj) => {
          if (obj.material && obj.material.color && obj.userData.originalColor) {
            obj.material.color.copy(obj.userData.originalColor);
          }
        });
        
        // restore light intensity
        vg.scene.traverse((obj) => {
          if (obj.type === 'AmbientLight') {
            obj.intensity = 0.2;
          }
          if (obj.type === 'DirectionalLight') {
            obj.intensity = 0.2;
          }
        });
      }
    };
    
    // add click event to button
    toggleButton.addEventListener('click', toggleDayNight);
    
    // keep keyboard shortcut
    vg.input.onDown['n'] = toggleDayNight;
  }

  setupArtwork(vg, textureLoader, data, room);
  //setupVideo(room, vg);
  setupBirds(vg, room);
  setupGrass(vg, textureLoader);

  //todo move this to vg.update / loop
  setInterval(() => {
    checkPlayerAboveMark(player.body.position);
  }, 2000);
}

export const createScene = (el, imageUrl) => {
  initRum(el, imageUrl);
};

export const loadSmileyFaceWrapper = () => {
  loadSmileyFace(vg, player, room);
}


export const removeSmileyFaceWrapper = () => {
  console.log('removeSmileyFaceWrapper');
  removeSmileyFace(vg);
}