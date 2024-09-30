import * as CANNON from 'cannon-es'
import * as THREE from 'three'
import VG from './vg'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { setupFloor } from './floor';
import { setupArtwork } from './art-canvas';
import { loadSmileyFace } from './smiley';

let vg;

declare global {
  interface Window {
    CANNON: typeof CANNON;
    THREE: typeof THREE;
    VG: typeof VG;
  }
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

  const ground = setupFloor();
  vg.add(ground);

  { // general
    vg.input.onDown['c'] = (key) => { vg.gui.show(vg.gui._hidden) }
    vg.input.onDown['h'] = (key) => { vg.hudEnabled = !vg.hudEnabled }
  }

  { // world
    console.log('vg.world', vg.world)
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

    body.position.set(0, 1.5, -70);

    var object = new THREE.Mesh(
      new THREE.BoxGeometry(1, 3, 2),
      new THREE.MeshBasicMaterial({ color: 0x00ff90 }));

    var player = {
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

        // Constrain player movement within the room
        this.body.position.x = Math.max(-room.width/2 + 1, Math.min(room.width/2 - 1, this.body.position.x));
        this.body.position.z = Math.max(-room.depth/2 + 1, Math.min(room.depth/2 - 1, this.body.position.z));

        this.object.position.copy(this.body.position);
        this.object.quaternion.copy(this.body.quaternion);

        vg.camera.position.copy(this.object.position);
        vg.camera.position.y += 1.2;
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
    var room = window.room = {
      width: 34 * 2.8,
      depth: 107 * 3.99,
      height: 4 * 1.5,
      opacity: 0.8,
      thickness: 1
    }

    setupArtwork(vg, textureLoader, data, room);
    //const ground = setupFloor();
    //vg.add(ground);

    { // left wall
      let body = window.lw = new CANNON.Body({
        type: CANNON.Body.STATIC,
        shape: new CANNON.Box(new CANNON.Vec3(room.thickness, room.height, room.depth))
      })

      body.position.set(-room.width/2 - room.thickness/2, room.height/2, 0)

      const diffuseTexture = textureLoader.load('/bricks/brick_wall_02_diff_1k.jpg');
      const displacementTexture = textureLoader.load('/bricks/brick_wall_02_disp_1k.png');

      const repeatX = room.depth / 3;
      const repeatY = room.height;

      diffuseTexture.repeat.set(repeatX, repeatY);
      displacementTexture.repeat.set(repeatX, repeatY);

      diffuseTexture.wrapS = diffuseTexture.wrapT = THREE.RepeatWrapping;
      displacementTexture.wrapS = displacementTexture.wrapT = THREE.RepeatWrapping;

      const geometry = new THREE.BoxGeometry(room.thickness, room.height * 7, room.depth)
      const material = new THREE.MeshStandardMaterial({
        map: diffuseTexture,
        displacementMap: displacementTexture,
        displacementScale: 0.1,
        transparent: true,
        opacity: room.opacity
      })
      const object = new THREE.Mesh(geometry, material)

      var leftWall = {
        name: 'leftWall',
        body: body,
        object: object,
      }

      vg.add(leftWall)
    }

    { // right wall
      let body = new CANNON.Body({
        type: CANNON.Body.STATIC,
        shape: new CANNON.Box(new CANNON.Vec3(0.5, 50, 50))
      })

      body.position.set(room.width/2 + room.thickness/2, room.height/2, 0)

      const geometry = new THREE.BoxGeometry(room.thickness, room.height, room.depth)
      const material = new THREE.MeshBasicMaterial({ color: 0xFFAAAA, transparent: true, opacity: 0 })
      const object = new THREE.Mesh(geometry, material)

      var rightWall = {
        name: 'rightWall',
        body: body,
        object: object
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
        object: object
      };
    
      vg.add(frontWall);
    }
    { // north wall
      const wallHeight = 100;
    
      const textureLoader = new THREE.TextureLoader();
    
      const diffuseTexture = textureLoader.load('/bricks/brick_wall_02_diff_1k.jpg');
      const displacementTexture = textureLoader.load('/bricks/brick_wall_02_disp_1k.png');
    
      const repeatX = 5;
      const repeatY = wallHeight / 10;
    
      diffuseTexture.repeat.set(repeatX, repeatY);
      displacementTexture.repeat.set(repeatX, repeatY);
    
      diffuseTexture.wrapS = diffuseTexture.wrapT = THREE.RepeatWrapping;
      displacementTexture.wrapS = displacementTexture.wrapT = THREE.RepeatWrapping;
    
      let body = new CANNON.Body({
        type: CANNON.Body.STATIC,
        shape: new CANNON.Box(new CANNON.Vec3(50, wallHeight / 2, 0.5))
      });
    
      body.position.set(0, wallHeight / 2, room.depth / 2 + room.thickness / 2);
    
      const geometry = new THREE.BoxGeometry(room.width, wallHeight, room.thickness);
      const material = new THREE.MeshStandardMaterial({ 
        map: diffuseTexture,
        displacementMap: displacementTexture,
        displacementScale: 0.1,
        roughness: 0.8,
        metalness: 0.2
      });
      const object = new THREE.Mesh(geometry, material);
    
      var northWall = {
        name: 'northWall',
        body: body,
        object: object
      };
    
      vg.add(northWall);
    }

    { // light
      const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.2);
      directionalLight.position.set(-40, 50, 50);
    
      const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.2);
    
      var target = new THREE.Mesh(
        new THREE.SphereGeometry(10, 16, 10),
        new THREE.MeshBasicMaterial({ color: 0xff0000 })
      );
      target.position.x = -40;
    
      vg.add({
        object: target,
        unremovable: true
      });
    
      directionalLight.target = target;
    
      vg.add({
        name: 'light',
        object: directionalLight,
        gui: [
          [ directionalLight.position, 'x', 'pos x' ],
          [ directionalLight.position, 'y', 'pos y' ],
          [ directionalLight.position, 'z', 'pos z' ],
          [ directionalLight.target.position, 'x', 'target pos x' ],
          [ directionalLight.target.position, 'y', 'target pos y' ],
          [ directionalLight.target.position, 'z', 'target pos z' ]
        ],
      });
    
      vg.add({
        name: 'ambientLight',
        object: ambientLight
      });
    }
  }

  { // smiley face
    loadSmileyFace(vg);
  }

  { // hangar
    const loader = new GLTFLoader();

    loader.load(
      '/hangar.glb',
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
    
        const scaleX = roomWidth / hangarWidth;
        const scaleY = roomHeight / hangarHeight;
        const scaleZ = roomDepth / hangarDepth;
    
        const scale = Math.min(scaleX, scaleY, scaleZ) * 6.8;
    
        // Create three hangars
        for (let i = 0; i < 3; i++) {
          const hangarClone = gltf.scene.clone();
          hangarClone.scale.set(scale, scale, scale);
          
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
              [hangarClone.scale, 'x', 0.1, 3, 0.01, 'scale x'],
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


  // { // birds sound
  //   const listener = new THREE.AudioListener();
  //   vg.camera.add(listener);

  //   const sound = new THREE.Audio(listener);
  //   const audioLoader = new THREE.AudioLoader();

  //   // audioLoader.load('./birds.mp3', function(buffer) {
  //   //   sound.setBuffer(buffer);
  //   //   sound.setLoop(true);
  //   //   sound.setVolume(100);
  //   // });

  //   // playSound = () => {
  //   //   sound.play();
  //   // };

  //   vg.add({
  //     name: 'audio',
  //     unremovable: true,
  //     object: sound
  //   });
  // }

  // loadSmileyFace(vg);
}

//let playSound

export const createScene = (el, imageUrl) => {
  initRum(el, imageUrl);
};