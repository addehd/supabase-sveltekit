import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function setupBirds(vg, room) {
    const loader = new GLTFLoader();

    loader.load('/Parrot.glb', (gltf) => {
        const bird = gltf.scene.children[0];
        bird.scale.set(0.2, 0.2, 0.2);
        bird.position.set(0, room.height * 0.8, 0);
        bird.rotation.y = Math.PI;

        // animation
        const mixer = new THREE.AnimationMixer(bird);
        const clips = gltf.animations;

        if (clips.length > 0) {
            const action = mixer.clipAction(clips[0]);

            action.timeScale = 0.002;
            action.play();
        }

        vg.add({
            name: 'bird',
            object: bird,
            update: (delta) => {
                bird.position.z -= 0.1;
                mixer.update(delta);
            }
        });
    });
}