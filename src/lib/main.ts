import * as CANNON from 'cannon-es'
import * as THREE from 'three'
import VG from './vg'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { setupFloor } from './floor';
import { setupArtwork } from './art-canvas';
import { loadSmileyFace } from './smiley';

let vg;
let player; // declare player at a higher scope

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

  vg = new VG(window);
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

    var mouse = settings._gui.addFolder('mouse')

    mouse.add(vg, 'mouseSensitivity', 0.0001, 0.1, 0.0001).name('sensitivity')
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

  { // mouse
    vg.add({
      name: 'mouse',
      unremovable: true,
      gui: [
        [ vg, 'mouseSensitivity', 0.0001, 0.1, 0.0001, "sensitivity" ]
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

    const xPosition = -room.width * 0.3;
    const zPosition = -room.depth * 0.46;

    body.position.set(xPosition, 1.5, zPosition);

    var object = new THREE.Mesh(
      new THREE.BoxGeometry(1, 3, 2),
      new THREE.MeshBasicMaterial({ color: 0x00ff90 }));

    const checkArtworkProximity = setupArtwork(vg, textureLoader, data, room);

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
          vg.camera.rotation.x = 0.31;
          vg.camera.rotation.y = -0.3;
          this.initialRotationSet = true;
        }

        checkArtworkProximity(this.object.position);
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

  { // background color
    vg.add({
      name: 'background',
      unremovable: true,
      gui: [
        [ VG.COLOR, vg.scene, 'background' ]
      ]
    })
  }

  { // room
    { // left wall
      let body = new CANNON.Body({
        type: CANNON.Body.STATIC,
        shape: new CANNON.Box(new CANNON.Vec3(room.thickness, room.height * 2, room.depth))
      });

      // define position constants
      const xPos = -room.width / 2 - room.thickness - 1;
      const yPos = room.height;
      const zPos = 0;
      // set body position using constants
      body.position.set(xPos, yPos, zPos);

      const diffuseTexture = textureLoader.load('/bricks/brick_wall_02_diff_1k.jpg');
      const displacementTexture = textureLoader.load('/bricks/brick_wall_02_disp_1k.png');

      const repeatX = room.depth / 3;
      const repeatY = room.height * 2;

      diffuseTexture.repeat.set(repeatX, repeatY);
      displacementTexture.repeat.set(repeatX, repeatY);

      diffuseTexture.wrapS = diffuseTexture.wrapT = THREE.RepeatWrapping;
      displacementTexture.wrapS = displacementTexture.wrapT = THREE.RepeatWrapping;

      const geometry = new THREE.BoxGeometry(room.thickness, room.height * 14, room.depth);
      const material = new THREE.MeshStandardMaterial({
        map: diffuseTexture,
        displacementMap: displacementTexture,
        opacity: 0.5
      });
      const object = new THREE.Mesh(geometry, material);

      var leftWall = {
        name: 'leftWall',
        body: body,
        object: object,
        gui: [
          // ensure the range allows for sufficient movement to the left
          [object.position, 'x', -room.width * 1.5, room.width, 0.1, 'pos x'],
          [object.position, 'y', 0, room.height * 2, 0.1, 'pos y'],
          [object.position, 'z', -room.depth, room.depth, 0.1, 'pos z'],
          [object.rotation, 'y', -Math.PI, Math.PI, 0.01, 'rot y']
        ]
      };

      vg.add(leftWall);

      // debugging: log the object to ensure it's being added correctly
      console.log('Left Wall:', leftWall);
    }
    { // right wall
      let body = new CANNON.Body({
        type: CANNON.Body.STATIC,
        shape: new CANNON.Box(new CANNON.Vec3(room.thickness, room.height * 2, room.depth))
      })

      body.position.set(room.width/2 + room.thickness/2, room.height, 0)

      const diffuseTexture = textureLoader.load('/bricks/brick_wall_02_diff_1k.jpg');
      const displacementTexture = textureLoader.load('/bricks/brick_wall_02_disp_1k.png');

      const repeatX = room.depth / 3;
      const repeatY = room.height * 2;

      diffuseTexture.repeat.set(repeatX, repeatY);
      displacementTexture.repeat.set(repeatX, repeatY);

      diffuseTexture.wrapS = diffuseTexture.wrapT = THREE.RepeatWrapping;
      displacementTexture.wrapS = displacementTexture.wrapT = THREE.RepeatWrapping;

      const geometry = new THREE.BoxGeometry(room.thickness, room.height * 14, room.depth)
      const material = new THREE.MeshStandardMaterial({
        map: diffuseTexture,
        displacementMap: displacementTexture,
        displacementScale: 0.1,
        roughness: 0.8,
        metalness: 0.2,
        
        transparent: true
      })
      const object = new THREE.Mesh(geometry, material)

      var rightWall = {
        name: 'rightWall',
        body: body,
        object: object,
        gui: [
          [object.position, 'x', -room.width, room.width, 0.1, 'pos x'],
          [object.position, 'y', 0, room.height * 2, 0.1, 'pos y'],
          [object.position, 'z', -room.depth, room.depth, 0.1, 'pos z'],
          [object.rotation, 'y', -Math.PI, Math.PI, 0.01, 'rot y'],
          [material, 'roughness', 0, 1, 0.01, 'roughness'],
          [material, 'metalness', 0, 1, 0.01, 'metalness'],
          [material, 'displacementScale', 0, 1, 0.01, 'displacement'],
          [material, 'opacity', 0, 1, 0.01, 'opacity']
        ]
      }

      vg.add(rightWall)
    }

    { // front wall
      const wallHeight = 50;
    
      const textureLoader = new THREE.TextureLoader();
    
      const diffuseTexture = textureLoader.load('/bricks/brick_wall_02_diff_1k.jpg');
      const displacementTexture = textureLoader.load('/bricks/brick_wall_02_disp_1k.png');
    
      const repeatX = room.width / 5.5;
      const repeatY = wallHeight / 5.5;
    
      diffuseTexture.repeat.set(repeatX, repeatY);
      displacementTexture.repeat.set(repeatX, repeatY);
    
      diffuseTexture.wrapS = diffuseTexture.wrapT = THREE.RepeatWrapping;
      displacementTexture.wrapS = displacementTexture.wrapT = THREE.RepeatWrapping;
    
      let body = new CANNON.Body({
        type: CANNON.Body.STATIC,
        shape: new CANNON.Box(new CANNON.Vec3(room.width * 1.2 / 2, wallHeight / 2, room.thickness / 2))
      });
    
      body.position.set(0, wallHeight / 2.6, -room.depth / 2 - room.thickness / 2);
    
      const geometry = new THREE.BoxGeometry(room.width * 1.2, wallHeight, room.thickness);
      const material = new THREE.MeshStandardMaterial({
        map: diffuseTexture,
        displacementMap: displacementTexture,
        displacementScale: 0.1,
        roughness: 0.8,
        metalness: 0.2
      });
      const object = new THREE.Mesh(geometry, material);
    
      var frontWall = {
        name: 'frontWall',
        body: body,
        object: object,
        gui: [
          [material, 'roughness', 0, 1, 0.01, 'roughness'],
          [material, 'metalness', 0, 1, 0.01, 'metalness'],
          [material, 'displacementScale', 0, 1, 0.01, 'displacement'],
          [body.position, 'x', -10, 10, 0.1, 'move x'],
          [body.position, 'y', 0, 20, 0.1, 'move y'],
          [body.position, 'z', -10, 10, 0.1, 'move z']
        ],
        // removed zyx property
      };
    
      vg.add(frontWall);
    }

    { // north wall
      const wallHeight = 150; // increased wall height
    
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
      body.position.set(0, wallPosition, room.depth / 2 + room.thickness / 2);
    
      const geometry = new THREE.BoxGeometry(room.width, wallHeight, room.thickness);
      const material = new THREE.MeshStandardMaterial({ 
        map: diffuseTexture,
        displacementMap: displacementTexture,
        displacementScale: 0.1,
        roughness: 0.8,
        metalness: 0.2
      });
      const object = new THREE.Mesh(geometry, material);
    
      const northWall = {
        name: 'northWall',
        body: body,
        object: object,
        gui: [
          [object.position, 'x', -room.width, room.width, 0.1, 'pos x'],
          [object.position, 'y', 0, room.height, 0.1, 'pos y'],
          [object.position, 'z', -room.depth, room.depth, 0.1, 'pos z'],
          [object.rotation, 'y', -Math.PI, Math.PI, 0.01, 'rot y']
        ]
      };
    
      vg.add(northWall);
    }

    { // light
      const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.2);
      directionalLight.position.set(-40, 50, 50);
    
      // remove target object
      // directionalLight.target = target; // comment or remove this line if not needed

      const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.2);
    
      vg.add({
        name: 'light',
        object: directionalLight,
        gui: [
          [ directionalLight.position, 'x', 'pos x' ],
          [ directionalLight.position, 'y', 'pos y' ],
          [ directionalLight.position, 'z', 'pos z' ]
          // remove target position controls if target is not used
        ],
      });
    
      vg.add({
        name: 'ambientLight',
        object: ambientLight
      });
    }
  }
 
  { // hangar
    const loader = new GLTFLoader();

    loader.load(
      '/hangar2.glb',
      function(gltf) {
        console.debug('gltf', gltf);
    
        const material = new THREE.MeshStandardMaterial({
          color: 0xC0C0C0,
          roughness: 0.3,
          metalness: 0.9
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
    
        const scaleX = (roomWidth / hangarWidth) * 1.2; // increase width by 20%
        const scaleY = roomHeight / hangarHeight;
        const scaleZ = roomDepth / hangarDepth;
    
        const scale = Math.min(scaleY, scaleZ) * 6.8; // use minimum of height and depth scales
    
        for (let i = 0; i < 3; i++) {
          const hangarClone = gltf.scene.clone();
          hangarClone.scale.set(scale * 1.2, scale, scale); // apply wider scale to x-axis
          
          // Adjust z position for each hangar
          const zOffset = (i - 1) * roomDepth / 3; // Distribute along z-axis
          hangarClone.position.set(0, 0, zOffset);
    
          vg.add({
            name: `hangar_${i + 1}`,
            object: hangarClone,
            gui: [
              [hangarClone.position, 'x', -roomWidth/2, roomWidth/2, 1, 'position x'],
              [hangarClone.position, 'y', -roomHeight/2, roomHeight/2, 1, 'position y'],
              [hangarClone.position, 'z', -roomDepth/2, roomDepth/2, 1, 'position z'],
              [hangarClone.scale, 'x', 0.1, 3.6, 0.01, 'scale x'], // increased max scale for x
              [hangarClone.scale, 'y', 0.1, 3, 0.01, 'scale y'],
              [hangarClone.scale, 'z', 0.1, 3, 0.01, 'scale z'],
              [hangarClone.rotation, 'y', -Math.PI, Math.PI, 0.01, 'rotation y']
            ]
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

  loadSmileyFace(vg, player, room);

  setupArtwork(vg, textureLoader, data, room);
}

export const createScene = (el, imageUrl) => {
  initRum(el, imageUrl);
};

export const loadSmileyFaceWrapper = () => {
  console.log('loadSmileyFaceWrapper');
  loadSmileyFace(vg, player, room); // player is now accessible
}
