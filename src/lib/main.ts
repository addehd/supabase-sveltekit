import * as CANNON from 'cannon-es'
import * as THREE from 'three'
import VG from './vg'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { setupFloor } from './floor';
import { setupArtwork } from './art-canvas';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';

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
      mass: 50,
      shape: new CANNON.Box(new CANNON.Vec3(1, 1, 1)) })

    var object = new THREE.Mesh(
      new THREE.BoxGeometry(1, 3, 2),
      new THREE.MeshBasicMaterial({ color: 0x00ff90 }))

    var player = window.player = {
      name: 'player',
      body: body,
      object: object,
      moveSpeed: 0.5,
      lookSpeed: 0.1,
      jumpSpeed: 10,
      crouchSpeed: 0.1,
      unremovable: true,
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
      keysDown: []}

    vg.add(player)

    vg.cameraTarget = object

    //vg.initMouse()

    // move
    vg.input.whilePressed['a'] = (key) => {
      let direction = new THREE.Vector3()
      vg.camera.getWorldDirection(direction)
      direction.y = 0
      direction.normalize()
      let left = new THREE.Vector3(direction.z, 0, -direction.x).normalize()
      player.body.velocity.x += left.x * player.moveSpeed
      player.body.velocity.z += left.z * player.moveSpeed
    }
  
    vg.input.whilePressed['d'] = (key) => {
      let direction = new THREE.Vector3()
      vg.camera.getWorldDirection(direction)
      direction.y = 0
      direction.normalize()
      let right = new THREE.Vector3(-direction.z, 0, direction.x).normalize()
      player.body.velocity.x += right.x * player.moveSpeed
      player.body.velocity.z += right.z * player.moveSpeed
    }
  
    vg.input.whilePressed['w'] = (key) => {
      let direction = new THREE.Vector3()
      vg.camera.getWorldDirection(direction)
      direction.y = 0
      direction.normalize()
      player.body.velocity.x += direction.x * player.moveSpeed
      player.body.velocity.z += direction.z * player.moveSpeed
    }
  
    vg.input.whilePressed['s'] = (key) => {
      let direction = new THREE.Vector3()
      vg.camera.getWorldDirection(direction)
      direction.y = 0
      direction.normalize()
      player.body.velocity.x -= direction.x * player.moveSpeed
      player.body.velocity.z -= direction.z * player.moveSpeed
    }

    vg.input.onDown[' '] = (key) => {
      if (Math.abs(player.body.velocity.y) < 1) {
        player.body.velocity.y += player.jumpSpeed
      }
    }

    vg.input.whilePressed['Control'] = (key) => player.body.velocity.y -= player.crouchSpeed

    // look
    vg.camera.rotation.order = "YXZ"
    vg.input.whilePressed['ArrowRight'] = (key) => { vg.camera.rotation.y -= 0.05 }
    vg.input.whilePressed['ArrowLeft'] = (key) => { vg.camera.rotation.y += 0.05 }
    vg.input.whilePressed['ArrowDown'] = (key) => { vg.camera.rotation.x -= 0.02 }
    vg.input.whilePressed['ArrowUp'] = (key) => { vg.camera.rotation.x += 0.02 }
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
      width: 34 * 1.8,
      depth: 107 * 1.38,
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

      const geometry = new THREE.BoxGeometry(room.thickness, room.height, room.depth)
      const material = new THREE.MeshBasicMaterial({ color: 0xAAFFAA, transparent: true, opacity: 0 })
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
      const textureLoader = new THREE.TextureLoader();

      const diffuseTexture = textureLoader.load('/bricks/brick_wall_02_diff_1k.jpg');
      const displacementTexture = textureLoader.load('/bricks/brick_wall_02_disp_1k.png');

      const repeatX = 4;
      const repeatY = 4;

      diffuseTexture.repeat.set(repeatX, repeatY);
      displacementTexture.repeat.set(repeatX, repeatY);

      diffuseTexture.wrapS = diffuseTexture.wrapT = THREE.RepeatWrapping;
      displacementTexture.wrapS = displacementTexture.wrapT = THREE.RepeatWrapping;

      let body = new CANNON.Body({
        type: CANNON.Body.STATIC,
        shape: new CANNON.Box(new CANNON.Vec3(50, 50, 0.5))
      })

      body.position.set(0, room.height*2, -room.depth/2 - room.thickness/2)

      const geometry = new THREE.BoxGeometry(room.width*1.2, room.height*6, room.thickness)
      const material = new THREE.MeshStandardMaterial({ 
        map: diffuseTexture,
        displacementMap: displacementTexture,
        displacementScale: 0.1,
        roughness: 0.8,
        metalness: 0.2
      })
      const object = new THREE.Mesh(geometry, material)

      var frontWall = {
        name: 'frontWall',
        body: body,
        object: object
      }

      vg.add(frontWall)
    }

    { // north wall (previously back wall)
      const textureLoader = new THREE.TextureLoader();

      const diffuseTexture = textureLoader.load('/bricks/brick_wall_02_diff_1k.jpg');
      const displacementTexture = textureLoader.load('/bricks/brick_wall_02_disp_1k.png');

      const repeatX = 4;
      const repeatY = 4;

      diffuseTexture.repeat.set(repeatX, repeatY);
      displacementTexture.repeat.set(repeatX, repeatY);

      diffuseTexture.wrapS = diffuseTexture.wrapT = THREE.RepeatWrapping;
      displacementTexture.wrapS = displacementTexture.wrapT = THREE.RepeatWrapping;

      let body = new CANNON.Body({
        type: CANNON.Body.STATIC,
        shape: new CANNON.Box(new CANNON.Vec3(50, 50, 0.5))
      })

      body.position.set(0, room.height*2, room.depth/2 + room.thickness/2)

      const geometry = new THREE.BoxGeometry(room.width, room.height*6, room.thickness)
      const material = new THREE.MeshStandardMaterial({ 
        map: diffuseTexture,
        displacementMap: displacementTexture,
        displacementScale: 0.1,
        roughness: 0.8,
        metalness: 0.2
      })
      const object = new THREE.Mesh(geometry, material)

      var northWall = {
        name: 'northWall',
        body: body,
        object: object
      }

      vg.add(northWall)
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

  // { // roto Cube
  //   var cube = window.cube = new THREE.Mesh(
  //     new THREE.BoxGeometry(1, 1, 1),
  //     new THREE.MeshBasicMaterial({ color: 0xff6030 }))

  //   cube.scale.set(5, 5, 5)
  //   cube.translateX(-10)

  //   var cube = window.cube = {
  //     name: 'cube',
  //     object: cube,
  //     gui: [
  //       [ cube.material.color, 'b', 0, 1, 0.1, 'cube blue' ],
  //       [ cube.scale, 'x', 0, 10, 1, 'scale x' ],
  //       [ cube.scale, 'y', 0, 10, 1, 'scale y' ],
  //       [ cube.scale, 'z', 0, 10, 1, 'scale z' ],
  //       [ cube.position, 'x', -10, 10, 1, 'pos x' ],
  //       [ cube.position, 'y', -10, 10, 1, 'pos y' ],
  //       [ cube.position, 'z', -10, 10, 1, 'pos z' ]
  //     ],
  //     update: function(delta) {
  //       this.object.rotation.y += 0.001 * delta
  //       this.object.rotation.x += 0.0001 * delta
  //       this.object.rotation.z += 0.0002 * delta
  //       this.object.translateX(Math.sin(0.01 * delta))
  //     }}

  //   vg.add(cube)
  // }

  // { // roto Line
  //   const object = new THREE.Line(
  //     new THREE.BufferGeometry().setFromPoints(
  //       [ new THREE.Vector3(-10, 0, 0),
  //         new THREE.Vector3(0, 10, 0),
  //         new THREE.Vector3(10, 0, 0)]),
  //     new THREE.LineBasicMaterial({ color: 0x0000ff }))

  //   var line = window.line = {
  //     name: 'roto line',
  //     object: object,
  //     gui: [
  //       [ object.rotation, 'x', 'pos x' ],
  //       [ object.rotation, 'y', 'pos y' ],
  //       [ object.rotation, 'z', 'pos z' ],
  //       [ object.scale, 'x', 'scale x' ]
  //     ],
  //     update: function(delta) {
  //       this.object.rotation.x += 0.001 * delta
  //       this.object.rotation.y += 0.001 * (delta % 10)
  //       this.object.rotation.z += 0.001 * (delta % 100)
  //     }}

  //   vg.add(line)
  // }

  { // gravity ball
    var body = new CANNON.Body({
      mass: 50,
      shape: new CANNON.Sphere(8) })

    body.position.y = 40
    body.position.x = 40

    var object = new THREE.Mesh(
      new THREE.SphereGeometry(10, 32, 10),
      new THREE.MeshBasicMaterial({ color: 0xfff030 }))

    var ball = window.ball = {
      name: 'ball',
      body: body,
      object: object,
      gui: [
        [ body.position, 'x', -10, 10, 1, 'x' ],
        [ body.position, 'y', -10, 10, 1, 'y' ],
        [ body.position, 'z', -10, 10, 1, 'z' ],
        [ body.velocity, 'x', -10, 10, 1, 'v x' ],
        [ body.velocity, 'y', -10, 10, 1, 'v y' ],
        [ body.velocity, 'z', -10, 10, 1, 'v z' ],
        [ body.quaternion, 'x', 0, 1, 0.01, 'q x' ],
        [ body.quaternion, 'y', 0, 1, 0.01, 'q y' ],
        [ body.quaternion, 'z', 0, 1, 0.01, 'q z' ],
        [ body.quaternion, 'w', 0, 10, 0.01, 'q w' ]
      ]}

    vg.add(ball)
  }

  { // guy Fawkes mask
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
    
        const scale = Math.min(scaleX, scaleY, scaleZ) * 5;
    
        gltf.scene.scale.set(scale, scale, scale);
    
        //center the hangar in the room
        gltf.scene.position.set(0, roomHeight / 2, 0);
    
        vg.add({
          name: 'hangar',
          object: gltf.scene,
          gui: [
            [gltf.scene.position, 'x', -roomWidth/2, roomWidth/2, 1, 'position x'],
            [gltf.scene.position, 'y', 0, roomHeight, 1, 'position y'],
            [gltf.scene.position, 'z', -roomDepth/2, roomDepth/2, 1, 'position z'],
            [gltf.scene.scale, 'x', 0.1, 3, 0.01, 'scale x'],
            [gltf.scene.scale, 'y', 0.1, 3, 0.01, 'scale y'],
            [gltf.scene.scale, 'z', 0.1, 3, 0.01, 'scale z'],
            [gltf.scene.rotation, 'y', -Math.PI, Math.PI, 0.01, 'rotation y']
          ]
        });
      },
      undefined,
      function (error) {
        console.error('Error loading GLTF file', error);
        alert('Failed to load the 3D model. Please check the path or file.');
      }
    );
  }

  { // HUD
    var width = 720
    var height = 480
    var margin = 20

    var hudCanvas = window.hudCanvas = new OffscreenCanvas(width, height)
    hudCanvas.width = width
    hudCanvas.height = height

    var context = hudCanvas.getContext('2d')
    context.font = "Normal 40px Arial"
    context.textAlign = 'center'
    context.fillStyle = "rgba(245,245,245,0.75)"
    context.fillText('Initializing...', width / 2 - margin, height / 2 - margin)

    var hudCamera = new THREE.OrthographicCamera(-width/2, width/2, height/2, -height/2, 0, 30)
    var hudScene = new THREE.Scene()

    var texture = new THREE.Texture(hudCanvas) 
    texture.needsUpdate = true

    var material = new THREE.MeshBasicMaterial({map: texture})
    material.transparent = true

    // Create plane to render the HUD. This plane fill the whole screen.
    var planeGeometry = new THREE.PlaneGeometry(width - margin, height - margin)
    var plane = new THREE.Mesh(planeGeometry, material)
    hudScene.add(plane)

    var hud = {
      update: function(delta) {
        //console.log('draw hud', this)
        vg.renderer.render(hudScene, hudCamera)
      }
    }

    vg.add(hud)
    vg.hud = hud.update
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

// export const playBirdsSound = () => {
//   playSound();
// };