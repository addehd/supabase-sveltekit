import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function setupBirds(vg, room) {
    const loader = new GLTFLoader();

    loader.load('/Parrot.glb', (gltf) => {
        const bird = gltf.scene.children[0];
        bird.scale.set(0.2, 0.2, 0.2);
        
        // setup initial movement state
        const movement = {
            speed: 50,
            direction: new THREE.Vector3(
                Math.random() - 0.5,
                Math.random() * 0.2 + 0.1,
                Math.random() - 0.5
            ).normalize(),
            lastChange: { direction: 0, speed: 0 },
            interval: { direction: 11000, speed: 30000 }
        };

        // animation mixer setup
        const mixer = new THREE.AnimationMixer(bird);
        const clips = gltf.animations;
        if (clips.length > 0) {
            const action = mixer.clipAction(clips[0]);
            action.timeScale = 0.00099;  // adjusted for better wing movement
            action.play();
        }

        vg.add({
            name: 'bird',
            object: bird,
            update: (delta) => {
                const time = Date.now();
                
                // handle movement changes
                if (time - movement.lastChange.direction > movement.interval.direction) {
                    const maxChange = 0.01;
                    ['x', 'y', 'z'].forEach(axis => {
                        movement.direction[axis] += (Math.random() * 2 - 1) * maxChange;
                    });
                    movement.direction.normalize();
                    movement.lastChange.direction = time;
                }

                if (time - movement.lastChange.speed > movement.interval.speed) {
                    movement.speed = 0.05 + Math.random() * 0.1;
                    movement.lastChange.speed = time;
                }

                // update position and orientation
                bird.position.add(movement.direction.clone().multiplyScalar(movement.speed));
                bird.lookAt(bird.position.clone().add(movement.direction));
                bird.rotateY(Math.PI / 2);

                // handle bounds
                const bounds = {
                    x: room.width * 0.3,
                    y: [room.height * 1.5, room.height * 3], // [min, max]
                    z: room.depth * 0.8
                };

                ['x', 'z'].forEach(axis => {
                    if (Math.abs(bird.position[axis]) > bounds[axis]) {
                        movement.direction[axis] *= -1;
                        bird.position[axis] = Math.sign(bird.position[axis]) * bounds[axis];
                    }
                });

                if (bird.position.y < bounds.y[0]) {
                    movement.direction.y = Math.abs(movement.direction.y);
                    bird.position.y = bounds.y[0];
                } else if (bird.position.y > bounds.y[1]) {
                    movement.direction.y *= -1;
                    bird.position.y = bounds.y[1];
                }

                mixer.update(delta);
            }
        });
    });
}

