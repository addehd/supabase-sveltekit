import * as THREE from 'three';

// optimize grass configuration
const BLADE_WIDTH = 0.1;
const BLADE_HEIGHT = 3.7;
const BLADE_HEIGHT_VARIATION = 0.3;
const BLADE_COUNT = 11000;
const FIELD_SIZE = 30;

// pre-calculate values used frequently
const PI2 = Math.PI * 2;
const VERTICES_PER_BLADE = 5;

const room = {
  width: 64 * 2,
  depth: 107 * 2,
  height: 4 * 1.5,
  thickness: 1,
  wallHeight: 50
} 


// add grass area configuration
const GRASS_AREAS = {
  rightStrip: {
    x: [room.width/2 - 10, room.width/2], // 10 units wide strip on right
    z: [-room.depth/2, room.depth/2]
  },
  bottomStrip: {
    x: [0, room.width/2], // right half of room
    z: [-room.depth/2, -room.depth/2 + 10] // 10 units deep strip
  }
};

function isInGrassArea(x: number, z: number): boolean {
  // check if point is in right strip
  const inRightStrip = (
    x >= GRASS_AREAS.rightStrip.x[0] && 
    x <= GRASS_AREAS.rightStrip.x[1] && 
    z >= GRASS_AREAS.rightStrip.z[0] && 
    z <= GRASS_AREAS.rightStrip.z[1]
  );

  // check if point is in bottom strip
  const inBottomStrip = (
    x >= GRASS_AREAS.bottomStrip.x[0] && 
    x <= GRASS_AREAS.bottomStrip.x[1] && 
    z >= GRASS_AREAS.bottomStrip.z[0] && 
    z <= GRASS_AREAS.bottomStrip.z[1]
  );

  return inRightStrip || inBottomStrip;
}

function generateBlade(center, vArrOffset) {

  const MID_WIDTH = BLADE_WIDTH * 0.5;
  const TIP_OFFSET = 0.1;
  const height = BLADE_HEIGHT + (Math.random() * BLADE_HEIGHT_VARIATION);

  const yaw = Math.random() * PI2;
  const yawUnitVec = new THREE.Vector3(Math.sin(yaw), 0, -Math.cos(yaw));
  const tipBend = Math.random() * Math.PI * 2;
  const tipBendUnitVec = new THREE.Vector3(Math.sin(tipBend), 0, -Math.cos(tipBend));

  // create blade vertices
  const bl = new THREE.Vector3().addVectors(center, new THREE.Vector3().copy(yawUnitVec).multiplyScalar(BLADE_WIDTH / 2));
  const br = new THREE.Vector3().addVectors(center, new THREE.Vector3().copy(yawUnitVec).multiplyScalar(-BLADE_WIDTH / 2));
  const tl = new THREE.Vector3().addVectors(center, new THREE.Vector3().copy(yawUnitVec).multiplyScalar(MID_WIDTH / 2));
  const tr = new THREE.Vector3().addVectors(center, new THREE.Vector3().copy(yawUnitVec).multiplyScalar(-MID_WIDTH / 2));
  const tc = new THREE.Vector3().addVectors(center, new THREE.Vector3().copy(tipBendUnitVec).multiplyScalar(TIP_OFFSET));

  tl.y += height / 2;
  tr.y += height / 2;
  tc.y += height;

  return {
    positions: [...bl.toArray(), ...br.toArray(), ...tr.toArray(), ...tl.toArray(), ...tc.toArray()],
    indices: [
      vArrOffset, vArrOffset + 1, vArrOffset + 2,
      vArrOffset, vArrOffset + 2, vArrOffset + 3,
      vArrOffset + 3, vArrOffset + 2, vArrOffset + 4
    ]
  };
}

function createGrassField() {
  // pre-allocate arrays with known size
  const positions = new Float32Array(BLADE_COUNT * VERTICES_PER_BLADE * 3);
  const indices = new Uint32Array(BLADE_COUNT * 12);
  const uvs = new Float32Array(BLADE_COUNT * VERTICES_PER_BLADE * 2);
  
  let posIndex = 0;
  let uvIndex = 0;
  let indexIndex = 0;
  let validBladeCount = 0;
  
  // keep trying until we get enough valid grass blades
  while (validBladeCount < BLADE_COUNT) {
    // generate position within room bounds
    const x = (Math.random() * room.width) - room.width/2;
    const z = (Math.random() * room.depth) - room.depth/2;
    
    // only create blade if position is in grass area
    if (isInGrassArea(x, z)) {
      const center = new THREE.Vector3(x, 0, z);
      const blade = generateBlade(center, validBladeCount * VERTICES_PER_BLADE);
      
      // directly set array values
      blade.positions.forEach(pos => {
        positions[posIndex++] = pos;
      });
      
      blade.indices.forEach(index => {
        indices[indexIndex++] = index;
      });
      
      // simplified UV assignment
      for (let j = 0; j < VERTICES_PER_BLADE * 2; j++) {
        uvs[uvIndex++] = Math.random();
      }
      
      validBladeCount++;
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  geometry.computeVertexNormals();
  
  return geometry;
}

export function setupGrass(vg, room) {
  // grass shader
  const grassShader = {
    vert: `
      varying vec2 vUv;
      uniform float time;
      
      void main() {
        vUv = uv;
        vec3 pos = position;
  
        // Adjusted wind speed multiplier
        float wind = sin(time * 0.01 + position.x * 0.5 + position.z * 0.5) * 0.05;
  
        pos.x += wind * pow(position.y, 2.0);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    frag: `
      varying vec2 vUv;
      uniform sampler2D grassTexture;
      uniform float time;
      
      void main() {
        vec4 grassColor = texture2D(grassTexture, vUv);
        gl_FragColor = grassColor;
      }
    `
  };

  // grass material
  const grassTexture = new THREE.TextureLoader().load('/grass.jpg');
  grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
  grassTexture.repeat.set(10, 10);
  
  const grassMaterial = new THREE.ShaderMaterial({
    uniforms: { 
      grassTexture: { value: grassTexture },
      time: { value: 0.0 }
    },
    vertexShader: grassShader.vert,
    fragmentShader: grassShader.frag,
    side: THREE.DoubleSide
  });

  // create and add grass
  const grassGeometry = createGrassField();
  const grassField = new THREE.Mesh(grassGeometry, grassMaterial);
  grassField.position.y = -3.0;
  
  // add to scene with animation
  vg.add({
    name: 'grass',
    object: grassField,
    update: function(delta) {
      grassMaterial.uniforms.time.value += delta;
    }
  });
}