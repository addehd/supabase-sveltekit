<script lang="ts">
  import { onMount } from 'svelte';
  import * as THREE from 'three';
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

  let container: HTMLDivElement;

  onMount(() => {
    // setup scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);

    // setup renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    // add ground plane
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 40),
      new THREE.MeshStandardMaterial({ color: 0x553311 })
    );
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // setup grass
    const bladeGeometry = new THREE.SphereGeometry(1, 24, 24, -0.2, 0.2, Math.PI/2, Math.PI/2);
    const grassMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        uniform float time;
        void main() {
          vec3 pos = position;
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

    for (let i = 0; i < 200; i++) {
      const row = Math.floor(i / 20);
      const col = i % 20;
      
      dummy.position.set(
        col * 2 - 20 + Math.random(),
        0,
        row * 2 - 20 + Math.random()
      );
      
      dummy.scale.set(0.05, 0.1 + Math.random() * 0.1, 0.04);
      dummy.rotation.set(Math.PI, Math.random() * Math.PI * 2, 0);
      
      dummy.updateMatrix();
      grassField.setMatrixAt(i, dummy.matrix);
    }
    scene.add(grassField);

    // animation loop
    function animate() {
      requestAnimationFrame(animate);
      grassMaterial.uniforms.time.value += 0.016;
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      container.removeChild(renderer.domElement);
    };
  });
</script>

<div bind:this={container} />

<style>
  div {
    width: 100%;
    height: 100vh;
    margin: 0;
    padding: 0;
    overflow: hidden;
  }
</style>
