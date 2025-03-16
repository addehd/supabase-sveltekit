import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import type VG from './vg';

export type WallConfig = {
  name: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  gui?: boolean;
}

export type RoomConfig = {
  width: number;
  depth: number;
  height: number;
  thickness: number;
  wallHeight?: number;
  opacity?: number;
  walls?: {
    north?: boolean;
    south?: boolean;
    east?: boolean;
    west?: boolean;
  };
}

export function setupWall(vg: VG, config: WallConfig, textureLoader: THREE.TextureLoader) {
  const body = new CANNON.Body({
    type: CANNON.Body.STATIC,
    shape: new CANNON.Box(new CANNON.Vec3(
      config.dimensions.width,
      config.dimensions.height / 2,
      config.dimensions.depth
    ))
  });
  
  body.position.set(
    config.position.x,
    config.position.y,
    config.position.z
  );

  // load textures
  const diffuseTexture = textureLoader.load('/bricks/brick_wall_02_diff_1k.jpg');
  const displacementTexture = textureLoader.load('/bricks/brick_wall_02_disp_1k.png');

  // setup texture repeats based on wall orientation
  const isNorthSouth = config.name.includes('north') || config.name.includes('south');
  const repeatX = isNorthSouth ? config.dimensions.width / 2 : config.dimensions.depth / 2;
  const repeatY = config.dimensions.height / 8;

  [diffuseTexture, displacementTexture].forEach(texture => {
    texture.repeat.set(repeatX, repeatY);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  });

  const material = new THREE.MeshStandardMaterial({
    map: diffuseTexture,
    displacementMap: displacementTexture,
    displacementScale: 0.1,
    roughness: 0.8,
    metalness: 0.2,
    opacity: 0.5
  });

  const object = new THREE.Mesh(
    new THREE.BoxGeometry(
      config.dimensions.width,
      config.dimensions.height,
      config.dimensions.depth
    ),
    material
  );

  const wall = {
    name: config.name,
    body,
    object,
    ...(config.gui && {
      gui: [
        [object.position, 'x', -config.dimensions.width * 1.5, config.dimensions.width, 0.1, 'pos x'],
        [object.position, 'y', 0, config.dimensions.height * 2, 0.1, 'pos y'],
        [object.position, 'z', -config.dimensions.depth, config.dimensions.depth, 0.1, 'pos z'],
        [object.rotation, 'y', -Math.PI, Math.PI, 0.01, 'rot y']
      ]
    })
  };

  vg.add(wall);
  return wall;
}

export function setupRoom(vg: VG, config: RoomConfig, textureLoader: THREE.TextureLoader) {
  const walls = config.walls || { north: true, south: true, east: true, west: true };

  // west wall
  if (walls.west) {
    setupWall(vg, {
      name: 'westWall',
      position: {
        x: -config.width/2 - config.thickness - 1,
        y: (config.wallHeight || config.height) / 4,
        z: 0
      },
      dimensions: {
        width: config.thickness,
        height: config.wallHeight || config.height,
        depth: config.depth
      }
    }, textureLoader);
  }

  // east wall
  if (walls.east) {
    setupWall(vg, {
      name: 'eastWall',
      position: {
        x: config.width/2 + config.thickness + 1,
        y: (config.wallHeight || config.height) / 4,
        z: 0
      },
      dimensions: {
        width: config.thickness,
        height: config.wallHeight || config.height,
        depth: config.depth * 2
      }
    }, textureLoader);
  }

  // north wall
  if (walls.north) {
    setupWall(vg, {
      name: 'northWall', 
      position: {
        x: -5,
        y: (config.wallHeight || config.height) / 4,
        z: config.depth/2 + config.thickness/2
      },
      dimensions: {
        width: config.width,
        height: config.wallHeight || config.height,
        depth: config.thickness
      }
    }, textureLoader);
  }

  // south wall
  if (walls.south) {
    setupWall(vg, {
      name: 'southWall',
      position: {
        x: -5,
        y: (config.wallHeight || config.height) / 4,
        z: -config.depth/2 - config.thickness/2
      },
      dimensions: {
        width: config.width,
        height: config.wallHeight || config.height,
        depth: config.thickness
      }
    }, textureLoader);
  }

  // setup lights
  const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.2);
  directionalLight.position.set(-40, 50, 50);
  const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.2);

  vg.add({ name: 'light', object: directionalLight });
  vg.add({ name: 'ambientLight', object: ambientLight });
} 