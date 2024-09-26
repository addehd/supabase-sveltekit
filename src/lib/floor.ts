import * as THREE from "three";
import * as CANNON from "cannon-es";

export const setupFloor = () => {
  const textureLoader = new THREE.TextureLoader();

  const colorTexture = textureLoader.load(
    "/Concrete031_1K-JPG/Concrete031_1K-JPG_Color.webp"
  );
  const displacementTexture = textureLoader.load(
    "/Concrete031_1K-JPG/Concrete031_1K-JPG_Displacement.webp"
  );
  const normalTexture = textureLoader.load(
    "/Concrete031_1K-JPG/Concrete031_1K-JPG_NormalDX.webp"
  );
  const roughnessTexture = textureLoader.load(
    "/Concrete031_1K-JPG/Concrete031_1K-JPG_Roughness.webp"
  );
  const aoTexture = textureLoader.load(
    "/Concrete031_1K-JPG/Concrete031_1K-JPG_AmbientOcclusion.webp"
  );

  colorTexture.wrapS = colorTexture.wrapT = THREE.RepeatWrapping;
  displacementTexture.wrapS = displacementTexture.wrapT = THREE.RepeatWrapping;
  normalTexture.wrapS = normalTexture.wrapT = THREE.RepeatWrapping;
  roughnessTexture.wrapS = roughnessTexture.wrapT = THREE.RepeatWrapping;
  aoTexture.wrapS = aoTexture.wrapT = THREE.RepeatWrapping;

  const repeatFactor = 10;
  colorTexture.repeat.set(repeatFactor, repeatFactor);
  displacementTexture.repeat.set(repeatFactor, repeatFactor);
  normalTexture.repeat.set(repeatFactor, repeatFactor);
  roughnessTexture.repeat.set(repeatFactor, repeatFactor);
  aoTexture.repeat.set(repeatFactor, repeatFactor);

  const roomWidth = 34 * 2.8;
  const roomLength = 107 * 3.4;
  const roomHeight = 2;

  const geometry = new THREE.PlaneGeometry(roomWidth, roomLength);
  const material = new THREE.MeshStandardMaterial({
    map: colorTexture,
    displacementMap: displacementTexture,
    normalMap: normalTexture,
    roughnessMap: roughnessTexture,
    aoMap: aoTexture,
    displacementScale: 0.05,
    side: THREE.DoubleSide,
    metalness: 0.1,
    aoMapIntensity: 0.5, // lighten up shadows
  });

  const object = new THREE.Mesh(geometry, material);

  object.rotation.x = -Math.PI / 2;
  object.position.y = -roomHeight / 2;

  const body = new CANNON.Body({
    type: CANNON.Body.STATIC,
    shape: new CANNON.Plane()
  });

  body.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  body.position.set(0, -roomHeight / 2, 0);

  const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1.5);

  const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 2);
  directionalLight.position.set(0, 10, 10);

  return {
    name: 'ground',
    body: body,
    object: object,
    ambientLight: ambientLight,
    directionalLight: directionalLight,
    gui: [
      [ body.position, 'x', -10, 10, 1, 'x' ],
      [ body.position, 'y', -10, 10, 1, 'y' ],
      [ body.position, 'z', -10, 10, 1, 'z' ],
      [ material, 'roughness', 0, 1, 0.01, 'roughness' ],
      [ material, 'metalness', 0, 1, 0.01, 'metalness' ],
      [ material.color, 'r', 0, 1, 0.01, 'color r' ],
      [ material.color, 'g', 0, 1, 0.01, 'color g' ],
      [ material.color, 'b', 0, 1, 0.01, 'color b' ],
      [ material.emissive, 'r', 0, 1, 0.01, 'emissive r' ],
      [ material.emissive, 'g', 0, 1, 0.01, 'emissive g' ],
      [ material.emissive, 'b', 0, 1, 0.01, 'emissive b' ],
      [ ambientLight, 'intensity', 0, 2, 0.01, 'ambient light' ],
      [ directionalLight, 'intensity', 0, 2, 0.01, 'directional light' ],
    ]
  };
};