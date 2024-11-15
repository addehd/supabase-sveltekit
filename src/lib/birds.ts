import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function setupBirds(vg, room) {
    const loader = new GLTFLoader();

    loader.load('/Parrot.glb', (gltf) => {
        const bird = gltf.scene.children[0];
        bird.scale.set(0.2, 0.2, 0.2);
        
        // initial position and movement parameters
        bird.position.set(0, room.height * 0.8, 0);
        const movement = {
            speed: 0.1,
            direction: new THREE.Vector3(
                Math.random() - 0.5,
                Math.random() * 0.2 - 0.1,
                Math.random() - 0.5
            ).normalize(),
            lastDirectionChange: 0,
            lastSpeedChange: 0,
            directionChangeInterval: 2000,
            speedChangeInterval: 3000
        };

        // animation mixer setup
        const mixer = new THREE.AnimationMixer(bird);
        const clips = gltf.animations;
        if (clips.length > 0) {
            const action = mixer.clipAction(clips[0]);
            action.timeScale = 0.00068;  // adjusted for better wing movement
            action.play();
        }

        vg.add({
            name: 'bird',
            object: bird,
            update: (delta) => {
                const time = Date.now();
                
                // randomly change direction
                if (time - movement.lastDirectionChange > movement.directionChangeInterval) {
                    movement.direction.set(
                        Math.random() - 0.5,
                        Math.random() * 0.2 - 0.1,
                        Math.random() - 0.5
                    ).normalize();
                    movement.lastDirectionChange = time;
                }

                // randomly change speed
                if (time - movement.lastSpeedChange > movement.speedChangeInterval) {
                    movement.speed = 0.05 + Math.random() * 0.1; // speed between 0.05 and 0.15
                    movement.lastSpeedChange = time;
                }

                // update position
                const currentPos = bird.position.clone();
                const targetPos = currentPos.clone().add(movement.direction);
                
                // make bird face direction of movement
                bird.lookAt(targetPos);
                bird.rotateY(Math.PI / 2); // adjust based on model orientation

                // move bird
                bird.position.add(movement.direction.clone().multiplyScalar(movement.speed));

                // keep bird within bounds
                const bounds = {
                    x: room.width * 0.8,
                    y: room.height * 0.8,
                    z: room.depth * 0.8
                };

                if (Math.abs(bird.position.x) > bounds.x) {
                    movement.direction.x *= -1;
                    bird.position.x = Math.sign(bird.position.x) * bounds.x;
                }
                if (Math.abs(bird.position.y) > bounds.y) {
                    movement.direction.y *= -1;
                    bird.position.y = Math.sign(bird.position.y) * bounds.y;
                }
                if (Math.abs(bird.position.z) > bounds.z) {
                    movement.direction.z *= -1;
                    bird.position.z = Math.sign(bird.position.z) * bounds.z;
                }

                mixer.update(delta);
            }
        });
    });
}

