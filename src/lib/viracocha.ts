import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import * as THREE from 'three'

export const setupViracocha = (vg, room) => {
  const loader = new GLTFLoader()
  // load textures
  const textureLoader = new THREE.TextureLoader()
  const baseColorTexture = textureLoader.load('/viracocha_inca/textures/defaultMat_baseColor.png')
  baseColorTexture.encoding = THREE.sRGBEncoding
  baseColorTexture.flipY = false
  baseColorTexture.wrapS = THREE.RepeatWrapping
  baseColorTexture.wrapT = THREE.RepeatWrapping
  const metallicRoughnessTexture = textureLoader.load('/viracocha_inca/textures/defaultMat_metallicRoughness.png')
  metallicRoughnessTexture.flipY = false
  const normalTexture = textureLoader.load('/viracocha_inca/textures/defaultMat_normal.png')
  normalTexture.flipY = false

  loader.load(
    '/viracocha_inca/scene.gltf',
    (gltf) => {
      // setup material with textures
      const material = new THREE.MeshStandardMaterial({
        map: baseColorTexture,
        metalnessMap: metallicRoughnessTexture,
        roughnessMap: metallicRoughnessTexture,
        normalMap: normalTexture,
        metalness: 0.1,
        roughness: 1,
        normalScale: new THREE.Vector2(1, 1),
        side: THREE.DoubleSide,
        transparent: true,
        alphaTest: 0.5
      })

      // apply material to all meshes
      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          child.material = material
        }
      })

      // scale and position the model
      const scale = 0.036
      gltf.scene.scale.set(scale, scale, scale)
      gltf.scene.position.set(0, 11, -161)
      gltf.scene.rotation.y = Math.PI * 2

      // add to scene with controls
      vg.add({
        name: 'viracocha',
        object: gltf.scene,
        gui: [
          [gltf.scene.position, 'x', -room.width/2, room.width/2, 1, 'pos x'],
          [gltf.scene.position, 'y', -10, 10, 0.1, 'pos y'], 
          [gltf.scene.position, 'z', -room.depth/2, room.depth/2, 1, 'pos z'],
          [gltf.scene.scale, 'x', 0.1, 5, 0.1, 'scale x'],
          [gltf.scene.scale, 'y', 0.1, 5, 0.1, 'scale y'],
          [gltf.scene.scale, 'z', 0.1, 5, 0.1, 'scale z'],
          [gltf.scene.rotation, 'y', -Math.PI, Math.PI, 0.01, 'rot y']
        ]
      })
    },
    undefined,
    (error) => {
      // handle loading errors
      console.error('error loading viracocha:', error)
    }
  )
}
