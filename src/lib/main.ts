import * as CANNON from 'cannon-es'
import * as THREE from 'three'
import VG from './vg'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

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

  // position artwork
  {
    data.forEach((artwork) => {
    textureLoader.load(artwork.image_url, (texture) => {
      const material = new THREE.MeshBasicMaterial({ map: texture });
      const body = new CANNON.Body({
        type: CANNON.Body.STATIC,
        shape: new CANNON.Box(new CANNON.Vec3(50, 50, 0.5))
      });

      let position;
      const artworkSize = { width: 100, height: 100, depth: 1 };
      switch (artwork.wall) {
        case 'east':
          position = { x: room.width / 2 - room.thickness / 2 - artworkSize.depth / 2, y: room.height / 2, z: 0 };
          break;
        case 'west':
          position = { x: -room.width / 2 + room.thickness / 2 + artworkSize.depth / 2, y: room.height / 2, z: 0 };
          break;
        case 'north':
          position = { x: 0, y: room.height / 2, z: -room.depth / 2 + room.thickness / 2 + artworkSize.depth / 2 };
          break;
        case 'south':
          position = { x: 0, y: room.height / 2, z: room.depth / 2 - room.thickness / 2 - artworkSize.depth / 2 };
          break;
        default:
          return;
      }

      body.position.set(position.x, position.y, position.z);

      const geometry = new THREE.BoxGeometry(artworkSize.width, artworkSize.height, artworkSize.depth);
      const object = new THREE.Mesh(geometry, material);
      object.position.copy(body.position);

      if (artwork.wall === 'east' || artwork.wall === 'west') {
        object.rotation.y = Math.PI / 2;
      }

      const artwork3D = {
        name: `${artwork.wall}Artwork`,
        body: body,
        object: object,
        gui: []
      };

      vg.add(artwork3D);
    });
  });
}

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

  { // Room
    var room = window.room = {
      width: 150,
      depth: 250,
      height: 59,
      opacity: 0.8,
      thickness: 5
    }

    { // ground
      let body = new CANNON.Body({
        type: CANNON.Body.STATIC,
        shape: new CANNON.Plane()
      })

      body.quaternion.setFromEuler(-Math.PI / 2, 0, 0)

      const geometry = new THREE.PlaneGeometry(room.width, room.depth)
      const material = new THREE.MeshBasicMaterial(
        { color: 0xAA00AA,
          transparent: true,
          opacity: room.opacity,
          side: THREE.DoubleSide })

      const object = new THREE.Mesh(geometry, material)

      var ground = window.ground = {
        name: 'ground',
        body: body,
        object: object,
        gui: [
          [ body.position, 'x', -10, 10, 1, 'x' ],
          [ body.position, 'y', -10, 10, 1, 'y' ],
          [ body.position, 'z', -10, 10, 1, 'z' ]
        ]}

      vg.add(ground)
    }

    { // left wall
      let body = window.lw = new CANNON.Body({
        type: CANNON.Body.STATIC,
        shape: new CANNON.Box(new CANNON.Vec3(room.thickness, room.height, room.depth))
      })

      body.position.set(-room.width/2 - room.thickness/2, room.height/2, 0)

      const geometry = new THREE.BoxGeometry(room.thickness, room.height, room.depth)
      const material = new THREE.MeshBasicMaterial({ color: 0xAAFFAA, transparent: true, opacity: room.opacity })
      const object = new THREE.Mesh(geometry, material)

      var leftWall = {
        name: 'leftWall',
        body: body,
        object: object,
        gui: [
          [ body.position, 'x', -100, 100, 1, 'pos x' ],
          [ body.position, 'y', -100, 100, 1, 'pos y' ],
          [ body.position, 'z', -100, 100, 1, 'pos z' ],
          [ body.quaternion, 'x', -1, 1, 0.01, 'rot x' ],
          [ body.quaternion, 'y', -1, 1, 0.01, 'rot y' ],
          [ body.quaternion, 'z', -1, 1, 0.01, 'rot z' ],
          [ body.quaternion, 'w', -1, 1, 0.01, 'rot w' ]
        ]
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
      const material = new THREE.MeshBasicMaterial({ color: 0xFFAAAA, transparent: true, opacity: room.opacity })
      const object = new THREE.Mesh(geometry, material)

      var rightWall = {
        name: 'rightWall',
        body: body,
        object: object
      }

      vg.add(rightWall)
    }

    { // front wall
      let body = new CANNON.Body({
        type: CANNON.Body.STATIC,
        shape: new CANNON.Box(new CANNON.Vec3(50, 50, 0.5))
      })

      body.position.set(0, room.height/2, -room.depth/2 - room.thickness/2)

      const geometry = new THREE.BoxGeometry(room.width, room.height, room.thickness)
      const material = new THREE.MeshBasicMaterial({ color: 0xAAAAFF, transparent: true, opacity: room.opacity })
      const object = new THREE.Mesh(geometry, material)

      var frontWall = {
        name: 'frontWall',
        body: body,
        object: object
      }

      vg.add(frontWall)
    }

    { // back wall
      let body = new CANNON.Body({
        type: CANNON.Body.STATIC,
        shape: new CANNON.Box(new CANNON.Vec3(50, 50, 0.5))
      })

      body.position.set(0, room.height/2, room.depth/2 + room.thickness/2)

      const geometry = new THREE.BoxGeometry(room.width, room.height, room.thickness)
      const material = new THREE.MeshBasicMaterial({ color: 0xFFAAFF, transparent: true, opacity: room.opacity })
      const object = new THREE.Mesh(geometry, material)

      var backWall = {
        name: 'backWall',
        body: body,
        object: object
      }

      vg.add(backWall)
    }

    { // light
      //const object = new THREE.AmbientLight(0x748491)
      //const object = new THREE.Light(0x748491)
      const object = new THREE.DirectionalLight(0x748491, 0.5)

      var target = new THREE.Mesh(
        new THREE.SphereGeometry(10, 16, 10),
        new THREE.MeshBasicMaterial({ color: 0xff0000 }))

      target.position.x = -40

      vg.add({
        object: target,
        unremovable: true
      })

      object.target = backWall.object
    
      var light = window.light = {
        name: 'light',
        object: object,
        gui: [
          [ object.position, 'x', 'pos x' ],
          [ object.position, 'y', 'pos y' ],
          [ object.position, 'z', 'pos z' ],
          [ object.target.position, 'x', 'target pos x' ],
          [ object.target.position, 'y', 'target pos y' ],
          [ object.target.position, 'z', 'target pos z' ]
        ],
        update: function(delta) {
          //this.object.position.y = Math.cos(delta) * 200 - 100
        }
      }

      vg.add(light)
    }
  }

  { // roto Cube
    var cube = window.cube = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshBasicMaterial({ color: 0xff6030 }))

    cube.scale.set(5, 5, 5)
    cube.translateX(-10)

    var cube = window.cube = {
      name: 'cube',
      object: cube,
      gui: [
        [ cube.material.color, 'b', 0, 1, 0.1, 'cube blue' ],
        [ cube.scale, 'x', 0, 10, 1, 'scale x' ],
        [ cube.scale, 'y', 0, 10, 1, 'scale y' ],
        [ cube.scale, 'z', 0, 10, 1, 'scale z' ],
        [ cube.position, 'x', -10, 10, 1, 'pos x' ],
        [ cube.position, 'y', -10, 10, 1, 'pos y' ],
        [ cube.position, 'z', -10, 10, 1, 'pos z' ]
      ],
      update: function(delta) {
        this.object.rotation.y += 0.001 * delta
        this.object.rotation.x += 0.0001 * delta
        this.object.rotation.z += 0.0002 * delta
        this.object.translateX(Math.sin(0.01 * delta))
      }}

    vg.add(cube)
  }

  { // roto Line
    const object = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(
        [ new THREE.Vector3(-10, 0, 0),
          new THREE.Vector3(0, 10, 0),
          new THREE.Vector3(10, 0, 0)]),
      new THREE.LineBasicMaterial({ color: 0x0000ff }))

    var line = window.line = {
      name: 'roto line',
      object: object,
      gui: [
        [ object.rotation, 'x', 'pos x' ],
        [ object.rotation, 'y', 'pos y' ],
        [ object.rotation, 'z', 'pos z' ],
        [ object.scale, 'x', 'scale x' ]
      ],
      update: function(delta) {
        this.object.rotation.x += 0.001 * delta
        this.object.rotation.y += 0.001 * (delta % 10)
        this.object.rotation.z += 0.001 * (delta % 100)
      }}

    vg.add(line)
  }

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
          color: 0xFFAAff,
          roughness: 0.5,
          metalness: 0.8
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
    
        const scale = Math.min(scaleX, scaleY, scaleZ) * 1.5;
    
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

    //vg.add(hud)
    vg.hud = hud.update
  }

  { // birds sound
    const listener = new THREE.AudioListener();
    vg.camera.add(listener);

    const sound = new THREE.Audio(listener);
    const audioLoader = new THREE.AudioLoader();

    audioLoader.load('./birds.mp3', function(buffer) {
      sound.setBuffer(buffer);
      sound.setLoop(true);
      sound.setVolume(100);
    });

    playSound = () => {
      sound.play();
    };

    vg.add({
      name: 'audio',
      unremovable: true,
      object: sound
    });
  }

}

let playSound

export const createScene = (el, imageUrl) => {
  initRum(el, imageUrl);
};

export const playBirdsSound = () => {
  playSound();
};