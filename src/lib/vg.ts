import * as CANNON from 'cannon-es'
import * as THREE from 'three'
import GUI from 'lil-gui'
import { VRButton } from 'three/addons/webxr/VRButton.js';

export default class VG {
  COLOR = {}

  background = 0x123455
  camera
  cameraTarget
  canvas
  fov = 100
  height = 600
  hud
  hudEnabled
  input = { keysDown : {}, onDown : {}, onUp : {}, whilePressed : {} }
  mesh
  mouseSensitivity = 0.002
  pitch = 0
  renderer
  scene
  things = []
  width = 800
  world
  yaw = 0
  vrEnabled = false

  constructor(window) {
    if (window) {
      this.width = window.innerWidth
      this.height = window.innerHeight
    }
    this.initWorld()
    this.initScene()
    this.initCamera()
    this.initCanvas()
    this.initRenderer()
    this.initGui()
    this.initInput()
    this.initMouse()
    this.initVR()
  }

  add = function(thing) {
    let i = this.things.indexOf(thing)
    if (i > -1) return

    //console.debug('+ thing', thing)
    this.things.push(thing)

    if (thing.body)
      this.world.addBody(thing.body)

    if (thing.object)
      this.scene.add(thing.object)

    // Check if GUI should be added, based on `showGui` property
    if (thing.gui instanceof Array && thing.showGui !== false) {
      thing._gui = this.gui.addFolder(thing.name || '')
      for (var g of thing.gui) {
        if (g[0] === VG.COLOR) {
          var l = thing._gui.addColor(g[1], g[2])
          .listen()
          continue
        }

        var l = thing._gui.add(g[0], g[1], g[2], g[3], g[4])
        .listen()

        if (g.length === 3) l.name(g[2])
        else if (g.length === 6) l.name(g[5])
      }

      var _this = this
      if (!thing.unremovable)
        thing._gui.add(
          { remove: function() {
            console.log('remove', this)
            _this.remove(thing) } },
          'remove')
    }

    if (thing.body && thing.object && !thing.update) {
      thing.update = this.defaultThingUpdate
    }
  }

  defaultThingUpdate(delta) {
    //console.debug('updating thing', this)
    this.object.position.copy(this.body.position)
    this.object.quaternion.copy(this.body.quaternion)
  }

  handlePressedKey = function(key) {
    if (typeof this.input.whilePressed[key] !== 'undefined')
      this.input.whilePressed[key](key)

    else console.debug('unhandled pressed key', key)
  }

  initCamera = function() {
    this.camera = new THREE.PerspectiveCamera(
      this.fov,
      this.width / this.height)
    this.camera.lookAt(0, 0, 0)
    this.scene.add(this.camera)
  }

  initCanvas = function() {
    this.canvas = document.querySelector('canvas#vg')

    if (!this.canvas) {
      this.canvas = document.createElement('canvas')
      this.canvas.id = 'vg'
      //this.canvas.style.width = '100%'
      this.canvas.style.width = this.width
      //this.canvas.style.height = '100%'
      this.canvas.style.height = this.height
      document.body.appendChild(this.canvas)
    }
  }

  initGui = function() {
    this.gui = new GUI({
      closeFolders: true })
  }

  initInput = function() {
    var _this = this
    var i = this.input

    window.addEventListener(
      'onbeforeunload',
      function(e) {
        e.preventDefault()
        e.returnValue = 'poop'
        e.stopPropagation()
        return false
      },
      true)

    document.addEventListener(
      'keydown',
      function(e) {
        if (typeof i.onDown[e.key] !== 'undefined')
          i.onDown[e.key](e.key)

        if (Object.keys(_this.input.whilePressed).indexOf(e.key) == -1)
          return

        e.preventDefault()
        i.keysDown[e.key] = true // TODO scene time?
      }
    )

    document.addEventListener(
      'keyup',
      function(e) {
        if (typeof i.onUp[e.key] !== 'undefined')
          i.onUp[e.key](e.key)

        if (Object.keys(_this.input.whilePressed).indexOf(e.key) == -1)
          return

        e.preventDefault()
        delete(i.keysDown[e.key])
      }
    )
  }

  initMouse = function() {
    var _this = this
    this.canvas.addEventListener("click", async () => {
      await _this.canvas.requestPointerLock({
        unadjustedMovement: true,
      })

      var handler = function(e) {
        _this.onMouseMove(e) }

      document.addEventListener(
        "pointerlockchange",
        function() {
          if (window.document.pointerLockElement === _this.canvas)
            window.addEventListener('mousemove', handler)
          else
            window.removeEventListener('mousemove', handler)
        })
    })

    window.addEventListener('blur', function() {
      console.log('blur release keysDown', _this.input.keysDown)
      _this.input.keysDown = []
    })
  }

  initRenderer = function() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas })

    this.renderer.setSize(this.width, this.height)
  }

  initScene = function() {
    this.scene = new THREE.Scene()
    this.scene.add(new THREE.AxesHelper(5))
    this.scene.background = new THREE.Color(0x334455)
  }

  initWorld = function() {
    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(0, -30, 0) })
  }

  initVR = function() {
    if (this.renderer) {
      // enable vr support
      this.renderer.xr.enabled = true
      document.body.appendChild(VRButton.createButton(this.renderer))
      
      // use vr animation loop
      this.renderer.setAnimationLoop(() => {
        this.world.fixedStep()
        this.update(16) // assuming ~60fps, using fixed timestep
        this.renderer.render(this.scene, this.camera)

        if (this.hudEnabled && typeof this.hud === 'function') {
          this.hud(16)
        }
      })
      
      this.vrEnabled = true
    }
  }

  onMouseMove = function(e) {
    this.yaw -= e.movementX * this.mouseSensitivity
    this.pitch -= e.movementY * this.mouseSensitivity
    this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch))

    this.camera.rotation.order = "YXZ"
    this.camera.rotation.y = this.yaw
    this.camera.rotation.x = this.pitch
  }

  remove = function(thing) {
    let i = this.things.indexOf(thing)
    if (!i < 0) return

    console.debug('remove thing', thing, typeof thing._gui)

    if (thing.body) this.world.removeBody(thing.body)
    if (thing.object) this.scene.remove(thing.object)
    if (thing._gui) thing._gui.destroy()

    this.things.splice(i, 1)
  }

  run = function() {
    // only run the standard animation loop if we're not in vr
    if (!this.vrEnabled) {
      let _this = this
      let time = Date.now()

      function tick() {
        const currentTime = Date.now()
        const delta = currentTime - time
        time = currentTime

        _this.world.fixedStep()
        _this.update(delta)
        _this.renderer.render(_this.scene, _this.camera)

        if (_this.hudEnabled && typeof _this.hud === 'function')
          _this.hud(delta)

        window.requestAnimationFrame(tick)
      }

      tick()
    }
  }

  update = function(delta) {
    for (var t of this.things) {
      if (typeof t.update === 'function') {
        t.update.call(t, delta)
      }
    }

    if (this.cameraTarget) {
      this.camera.position.copy(this.cameraTarget.position)
      //this.cameraTarget.rotation.y = this.camera.rotation.y
    }
      //this.camera.rotation.y = this.cameraTarget.rotation.y }
      //this.camera.quaternion.copy(this.cameraTarget.quaternion)

    for (var k of Object.keys(this.input.keysDown)) {
      this.handlePressedKey(k)
    }
  }
}