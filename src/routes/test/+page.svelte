<script>
  import { onMount } from 'svelte';
  import * as THREE from 'three';
  import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js';
  import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';

  let camera, scene, renderer, controls;

  function Element(id, x, y, z, ry) {
    const div = document.createElement('div');
    div.style.width = '480px';
    div.style.height = '360px';
    div.style.backgroundColor = '#000';

    const iframe = document.createElement('iframe');
    iframe.style.width = '480px';
    iframe.style.height = '360px';
    iframe.style.border = '0px';
    iframe.src = ['https://www.youtube.com/embed/', id, '?rel=0'].join('');
    div.appendChild(iframe);

    const object = new CSS3DObject(div);
    object.position.set(x, y, z);
    object.rotation.y = ry;

    return object;
  }

  onMount(() => {
    const container = document.getElementById('container');

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 5000);
    camera.position.set(500, 350, 750);

    scene = new THREE.Scene();

    renderer = new CSS3DRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    const group = new THREE.Group();
    group.add(new Element('SJOz3qjfQXU', 0, 0, 240, 0));
    group.add(new Element('Y2-xZ-1HE-Q', 240, 0, 0, Math.PI / 2));
    group.add(new Element('IrydklNpcFI', 0, 0, -240, Math.PI));
    group.add(new Element('9ubytEsCaS0', -240, 0, 0, -Math.PI / 2));
    scene.add(group);

    controls = new TrackballControls(camera, renderer.domElement);
    controls.rotateSpeed = 4;

    window.addEventListener('resize', onWindowResize);

    const blocker = document.getElementById('blocker');
    blocker.style.display = 'none';

    controls.addEventListener('start', () => {
      blocker.style.display = '';
    });
    controls.addEventListener('end', () => {
      blocker.style.display = 'none';
    });

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

<style>
  body {
    background-color: #ffffff;
  }

  #blocker {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
  }
</style>

<div id="container"></div>
<div id="blocker"></div>