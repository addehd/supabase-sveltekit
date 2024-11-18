import * as THREE from 'three';

export function setupGrass(vg, room) {
  // create curved grass blade geometry
  const bladeGeometry = new THREE.SphereGeometry(
    1,                // radius
    24,               // widthSegments
    24,               // heightSegments
    -0.2,            // phiStart
    0.2,             // phiLength
    Math.PI/2,       // thetaStart
    Math.PI/2        // thetaLength
  );

  // green material with double-sided rendering
  const grassMaterial = new THREE.ShaderMaterial({
    vertexShader: `
      uniform float time;
      void main() {
        vec3 pos = position;
        // add wave motion
        float wave = sin(time * 2.0 + position.y * 0.5);
        pos.x += wave * 0.2;
        pos.z += wave * 0.1;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `void main() { gl_FragColor = vec4(0.1, 0.6, 0.1, 1.0); }`,
    uniforms: { time: { value: 0 } },
    side: THREE.DoubleSide
  });

  const grassField = new THREE.InstancedMesh(bladeGeometry, grassMaterial, 200);
  const dummy = new THREE.Object3D();

  // create grass in rows with slight randomness
  for (let i = 0; i < 200; i++) {
    const row = Math.floor(i / 20);
    const col = i % 20;
    
    dummy.position.set(
      col * 2 - 20 + Math.random(),     // x: spread in rows
      0,                                 // y: on ground
      row * 2 - 20 + Math.random()      // z: spread in columns
    );
    
    // randomize scale and rotation
    dummy.scale.set(
      0.05,                             // thin
      0.1 + Math.random() * 0.1,        // varying height
      0.04                              // thin
    );
    dummy.rotation.set(
      Math.PI,                          // flip upright
      Math.random() * Math.PI * 2,      // random facing
      0
    );
    
    dummy.updateMatrix();
    grassField.setMatrixAt(i, dummy.matrix);
  }

  vg.add({
    name: 'grass',
    object: grassField,
    update: (delta) => grassMaterial.uniforms.time.value += delta
  });
}