<script>
  import { onMount } from 'svelte';
  import * as THREE from 'three';
  import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js';

  let camera, scene, renderer, controls;
  let videoElement, videoTexture;

  onMount(() => {
    const container = document.getElementById('container');

    // setup camera
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 5000);
    camera.position.set(0, 0, 1000);

    scene = new THREE.Scene();

    // setup renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // setup video texture
    videoElement = document.createElement('video');
    videoElement.src = '/test.mp4';  // make sure this file exists in static/
    videoElement.loop = true;
    videoElement.muted = true;
    videoElement.playsInline = true;
    
    // add error handling and loading events
    videoElement.addEventListener('error', (e) => {
      console.error('Video error:', videoElement.error);
    });

    videoElement.addEventListener('loadeddata', () => {
      console.log('Video loaded successfully');
    });

    // wait for video to load before playing
    videoElement.load();
    videoElement.play().catch(e => console.error('Play failed:', e));

    console.log('videoElement', videoElement);

    videoTexture = new THREE.VideoTexture(videoElement);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    
    // create video plane
    const geometry = new THREE.PlaneGeometry(480, 360);
    const material = new THREE.MeshBasicMaterial({ 
      map: videoTexture,
      side: THREE.DoubleSide 
    });
    const videoMesh = new THREE.Mesh(geometry, material);
    scene.add(videoMesh);

    // setup controls
    controls = new TrackballControls(camera, renderer.domElement);
    controls.rotateSpeed = 4;

    window.addEventListener('resize', onWindowResize);
    animate();
  });

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
</script>

<div id="container"></div>