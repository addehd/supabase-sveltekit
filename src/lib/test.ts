import * as CANNON from 'cannon-es'
import * as THREE from 'three'
import VG from './vg'
import { setupFloor } from './floor';
import { setupArtwork } from './art-canvas';
import { loadSmileyFace } from './smiley';
import { setupVideo } from './video-cube';
import { setupBirds } from './birds';
import { setupGrass } from './grass';
import { setupMark } from './mark';
import { VRButton } from 'three/addons/webxr/VRButton.js';
const renderer = new THREE.WebGLRenderer();



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
  //document.body.appendChild(VRButton.createButton(renderer));
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
      gui: [
        [ vg.world.gravity, 'y', -100, 10, 0.1, 'gravity' ]
      ]
    })
  }

  { // settings
    var settings = {
      name: 'settings',
      unremovable: true,
      gui: []
    }

    vg.add(settings)
  }

  { // camera
    vg.add({
      name: 'camera',
      unremovable: true,
      gui: [
        [ vg.camera.rotation, 'x', -10, 10 ],
        [ vg.camera.rotation, 'y', -10, 10 ],
        [ vg.camera.rotation, 'z', -10, 10 ],
        [ vg.camera.quaternion, 'x', -1, 1, 0.01, "q x" ],
        [ vg.camera.quaternion, 'y', -1, 1, 0.01, "q y" ],
        [ vg.camera.quaternion, 'z', -1, 1, 0.01, "q z" ],
        [ vg.camera.quaternion, 'w', -1, 1, 0.01, "q w" ]
      ]
    })
  }

  { // player
    var body = new CANNON.Body({
      mass: 30,
      shape: new CANNON.Box(new CANNON.Vec3(1, 1, 1)),
      linearDamping: 0.9,
      angularDamping: 0.9
    });

    body.position.set(room.player.x, room.player.y, room.player.z);

    var object = new THREE.Mesh(
      new THREE.BoxGeometry(1, 3, 2),
      new THREE.MeshBasicMaterial({ color: 0x00ff90 }));

    //const checkArtworkProximity = setupArtwork(vg, textureLoader, data, room);

    player = {
      name: 'player',
      body: body,
      object: object,
      moveSpeed: 2,
      lookSpeed: 0.1,
      jumpSpeed: 10,
      crouchSpeed: 0.1,
      unremovable: true,
      moveDirection: new THREE.Vector3(),
      gui: [
        [ object.position, 'x', -100, 100, 10, 'object x' ],
        [ object.position, 'y', -100, 100, 10, 'y' ],
        [ object.position, 'z', -100, 100, 10, 'z' ],
        [ object.rotation, 'x', -10, 10, 0.1, "r x" ],
        [ object.rotation, 'y', -10, 10, 0.1, "r y" ],
        [ object.rotation, 'z', -10, 10, 0.1, "r z" ],
        [ body.position, 'x', -100, 100, 10, 'body x' ],
        [ body.position, 'y', -100, 100, 10, 'y' ],
        [ body.position, 'z', -100, 100, 10, 'z' ],
        [ body.velocity, 'x', -10, 10, 0.1, "v x" ],
        [ body.velocity, 'y', -10, 10, 0.1, "v y" ],
        [ body.velocity, 'z', -10, 10, 0.1, "v z" ],
        [ body.quaternion, 'x', -1, 1, 0.01, "q x" ],
        [ body.quaternion, 'y', -1, 1, 0.01, "q y" ],
        [ body.quaternion, 'z', -1, 1, 0.01, "q z" ],
        [ body.quaternion, 'w', -1, 1, 0.01, "q w" ]
      ],
      keysDown: {},
      update: function(delta) {
        this.moveDirection.set(0, 0, 0);
        if (this.keysDown['s']) this.moveDirection.z -= 1;
        if (this.keysDown['w']) this.moveDirection.z += 1;
        if (this.keysDown['a']) this.moveDirection.x -= 1;
        if (this.keysDown['d']) this.moveDirection.x += 1;
        this.moveDirection.normalize();

        let cameraDirection = new THREE.Vector3();
        vg.camera.getWorldDirection(cameraDirection);
        cameraDirection.y = 0;
        cameraDirection.normalize();
        let sideDirection = new THREE.Vector3(-cameraDirection.z, 0, cameraDirection.x);
        
        let moveImpulse = new CANNON.Vec3(
          (this.moveDirection.x * sideDirection.x + this.moveDirection.z * cameraDirection.x) * this.moveSpeed * delta,
          0,
          (this.moveDirection.x * sideDirection.z + this.moveDirection.z * cameraDirection.z) * this.moveSpeed * delta
        );
        this.body.applyImpulse(moveImpulse);

        // constrain player movement within the room
        this.body.position.x = Math.max(-room.width/2 + 1, Math.min(room.width/2 - 1, this.body.position.x));
        this.body.position.z = Math.max(-room.depth/2 + 1, Math.min(room.depth/2 - 1, this.body.position.z));

        this.object.position.copy(this.body.position);
        this.object.quaternion.copy(this.body.quaternion);

        vg.camera.position.copy(this.object.position);
        vg.camera.position.y += 1.2;

        // initial camera rotation to look up and to the right
        if (!this.initialRotationSet) {
          vg.camera.rotation.x = room.player.look.x;
          vg.camera.rotation.y = room.player.look.y;
          this.initialRotationSet = true;
        }
      }
    };

    vg.add(player);

    vg.cameraTarget = object;

    // input handling
    ['w', 'a', 's', 'd'].forEach(key => {
      vg.input.onDown[key] = () => { player.keysDown[key] = true; };
      vg.input.onUp[key] = () => { player.keysDown[key] = false; };
    });

    vg.input.onDown[' '] = (key) => {
      if (Math.abs(player.body.velocity.y) < 0.1) {
        player.body.applyImpulse(new CANNON.Vec3(0, player.jumpSpeed, 0));
      }
    };

    vg.input.whilePressed['Control'] = (key) => player.body.velocity.y -= player.crouchSpeed;

    // look
    vg.camera.rotation.order = "YXZ";
    vg.input.whilePressed['ArrowRight'] = (key) => { vg.camera.rotation.y -= 0.05 };
    vg.input.whilePressed['ArrowLeft'] = (key) => { vg.camera.rotation.y += 0.05 };
    vg.input.whilePressed['ArrowDown'] = (key) => { vg.camera.rotation.x -= 0.02 };
    vg.input.whilePressed['ArrowUp'] = (key) => { vg.camera.rotation.x += 0.02 };
  }

  { // room
    { // west
      const wallHeight = room.wallHeight;

      let body = new CANNON.Body({
        type: CANNON.Body.STATIC,
        shape: new CANNON.Box(new CANNON.Vec3(room.thickness, wallHeight / 2, room.depth))
      });

      // define position constants
      const xPos = -room.width / 2 - room.thickness - 1;
      const yPos = wallHeight / 4;
      const zPos = 0;
      // set body position using constants
      body.position.set(xPos, yPos, zPos);

      const diffuseTexture = textureLoader.load('/bricks/brick_wall_02_diff_1k.jpg');
      const displacementTexture = textureLoader.load('/bricks/brick_wall_02_disp_1k.png');

      const repeatX = room.depth / 2;
      const repeatY = room.height;

      diffuseTexture.repeat.set(repeatX, repeatY);
      displacementTexture.repeat.set(repeatX, repeatY);

      diffuseTexture.wrapS = diffuseTexture.wrapT = THREE.RepeatWrapping;
      displacementTexture.wrapS = displacementTexture.wrapT = THREE.RepeatWrapping;

      const geometry = new THREE.BoxGeometry(room.thickness, wallHeight, room.depth);
      const material = new THREE.MeshStandardMaterial({
        map: diffuseTexture,
        displacementMap: displacementTexture,
        opacity: 0.5
      });
      const object = new THREE.Mesh(geometry, material);

      var west = {
        name: 'west',
        body: body,
        object: object,
        gui: [
          [object.position, 'x', -room.width * 1.5, room.width, 0.1, 'pos x'],
          [object.position, 'y', 0, room.height * 2, 0.1, 'pos y'],
          [object.position, 'z', -room.depth, room.depth, 0.1, 'pos z'],
          [object.rotation, 'y', -Math.PI, Math.PI, 0.01, 'rot y']
        ]
      };

      vg.add(west);
    }
    
    // { // east
    //   let body = new CANNON.Body({
    //     type: CANNON.Body.STATIC,
    //     shape: new CANNON.Box(new CANNON.Vec3(room.thickness, room.height * 2, room.depth))
    //   })

    //   body.position.set(room.width/2 + room.thickness/2, room.height, 0)

    //   const diffuseTexture = textureLoader.load('/bricks/brick_wall_02_diff_1k.jpg');
    //   const displacementTexture = textureLoader.load('/bricks/brick_wall_02_disp_1k.png');

    //   const repeatX = room.depth / 3;
    //   const repeatY = room.height * 2;

    //   diffuseTexture.repeat.set(repeatX, repeatY);
    //   displacementTexture.repeat.set(repeatX, repeatY);

    //   diffuseTexture.wrapS = diffuseTexture.wrapT = THREE.RepeatWrapping;
    //   displacementTexture.wrapS = displacementTexture.wrapT = THREE.RepeatWrapping;

    //   const geometry = new THREE.BoxGeometry(room.thickness, room.height * 14, room.depth)
    //   const material = new THREE.MeshStandardMaterial({
    //     map: diffuseTexture,
    //     displacementMap: displacementTexture,
    //     displacementScale: 0.1,
    //     roughness: 0.8,
    //     metalness: 0.2,
        
    //     transparent: true
    //   })
    //   const object = new THREE.Mesh(geometry, material)

    //   var east = {
    //     name: 'east',
    //     body: body,
    //     object: object,
    //     gui: [
    //       [object.position, 'x', -room.width, room.width, 0.1, 'pos x'],
    //       [object.position, 'y', 0, room.height * 2, 0.1, 'pos y'],
    //       [object.position, 'z', -room.depth, room.depth, 0.1, 'pos z'],
    //       [object.rotation, 'y', -Math.PI, Math.PI, 0.01, 'rot y'],
    //       [material, 'roughness', 0, 1, 0.01, 'roughness'],
    //       [material, 'metalness', 0, 1, 0.01, 'metalness'],
    //       [material, 'displacementScale', 0, 1, 0.01, 'displacement'],
    //       [material, 'opacity', 0, 1, 0.01, 'opacity']
    //     ]
    //   }

    //   vg.add(east)
    // }

    // { // south
    //   const wallHeight = 50;
    
    //   const textureLoader = new THREE.TextureLoader();
    
    //   const diffuseTexture = textureLoader.load('/bricks/brick_wall_02_diff_1k.jpg');
    //   const displacementTexture = textureLoader.load('/bricks/brick_wall_02_disp_1k.png');
    
    //   const repeatX = room.width / 5.5;
    //   const repeatY = wallHeight / 5.5;
    
    //   diffuseTexture.repeat.set(repeatX, repeatY);
    //   displacementTexture.repeat.set(repeatX, repeatY);
    
    //   diffuseTexture.wrapS = diffuseTexture.wrapT = THREE.RepeatWrapping;
    //   displacementTexture.wrapS = displacementTexture.wrapT = THREE.RepeatWrapping;
    
    //   let body = new CANNON.Body({
    //     type: CANNON.Body.STATIC,
    //     shape: new CANNON.Box(new CANNON.Vec3(room.width * 1.2 / 2, wallHeight / 2, room.thickness / 2))
    //   });
    
    //   body.position.set(0, wallHeight / 2.6, -room.depth / 2 - room.thickness / 2);
    
    //   const geometry = new THREE.BoxGeometry(room.width * 1.2, wallHeight, room.thickness);
    //   const material = new THREE.MeshStandardMaterial({
    //     map: diffuseTexture,
    //     displacementMap: displacementTexture,
    //     displacementScale: 0.1,
    //     roughness: 0.8,
    //     metalness: 0.2
    //   });
    //   const object = new THREE.Mesh(geometry, material);
    
    //   var south = {
    //     name: 'south',
    //     body: body,
    //     object: object,
    //     gui: [
    //       [material, 'roughness', 0, 1, 0.01, 'roughness'],
    //       [material, 'metalness', 0, 1, 0.01, 'metalness'],
    //       [material, 'displacementScale', 0, 1, 0.01, 'displacement'],
    //       [body.position, 'x', -10, 10, 0.1, 'move x'],
    //       [body.position, 'y', 0, 20, 0.1, 'move y'],
    //       [body.position, 'z', -10, 10, 0.1, 'move z']
    //     ],
    //   };
    
    //   vg.add(south);
    // }

    { // north
      const wallHeight = room.wallHeight;
    
      const textureLoader = new THREE.TextureLoader();
    
      const diffuseTexture = textureLoader.load('/bricks/brick_wall_02_diff_1k.jpg');
      const displacementTexture = textureLoader.load('/bricks/brick_wall_02_disp_1k.png');
    
      const repeatX = 5;
      const repeatY = wallHeight / 8;
    
      diffuseTexture.repeat.set(repeatX, repeatY);
      displacementTexture.repeat.set(repeatX, repeatY);
    
      diffuseTexture.wrapS = diffuseTexture.wrapT = THREE.RepeatWrapping;
      displacementTexture.wrapS = displacementTexture.wrapT = THREE.RepeatWrapping;
    
      let body = new CANNON.Body({
        type: CANNON.Body.STATIC,
        shape: new CANNON.Box(new CANNON.Vec3(50, wallHeight / 2, 0.5))
      });
    
      // lowered position of north wall
      const wallPosition = wallHeight / 4;
      body.position.set(-5, wallPosition, room.depth / 2 + room.thickness / 2);
    
      const geometry = new THREE.BoxGeometry(room.width, wallHeight, room.thickness);
      const material = new THREE.MeshStandardMaterial({ 
        map: diffuseTexture,
        displacementMap: displacementTexture,
        displacementScale: 0.1,
        roughness: 0.8,
        metalness: 0.2
      });
      const object = new THREE.Mesh(geometry, material);
    
      const north = {
        name: 'north',
        body: body,
        object: object,
        gui: [
          [object.position, 'x', -room.width, room.width, 0.1, 'pos x'],
          [object.position, 'y', 0, room.height, 0.1, 'pos y'],
          [object.position, 'z', -room.depth, room.depth, 0.1, 'pos z'],
          [object.rotation, 'y', -Math.PI, Math.PI, 0.01, 'rot y']
        ]
      };
    
      vg.add(north);
    }

    { // light
      const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.2);
      directionalLight.position.set(-40, 50, 50);
    
      const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.2);
    
      vg.add({
        name: 'light',
        object: directionalLight,
        gui: [
          [ directionalLight.position, 'x', 'pos x' ],
          [ directionalLight.position, 'y', 'pos y' ],
          [ directionalLight.position, 'z', 'pos z' ]
        ],
      });
    
      vg.add({
        name: 'ambientLight',
        object: ambientLight
      });
    }
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

    vg.scene.background = skyboxTexture;
  }

  setupArtwork(vg, textureLoader, data, room);
  //setupVideo(room, vg);
  setupBirds(vg, room);
  setupGrass(vg, textureLoader);
  setupMark(vg, room, markMatrix);
}

export const createScene = (el, imageUrl) => {
  initRum(el, imageUrl);
};

export const loadSmileyFaceWrapper = () => {
  loadSmileyFace(vg, player, room);
}

// After rendering
// console.log('Memory usage:', renderer.info.memory);
// console.log('Geometries:', renderer.info.memory.geometries);
// console.log('Textures:', renderer.info.memory.textures);

// // Render statistics
// console.log('Render calls:', renderer.info.render.calls);
// console.log('Triangles:', renderer.info.render.triangles);