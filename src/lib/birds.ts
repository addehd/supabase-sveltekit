import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function setupBirds(vg, room) {
    const loader = new GLTFLoader();

    loader.load('/Parrot.glb', (gltf) => {
        const bird = gltf.scene.children[0];
        bird.scale.set(0.2, 0.2, 0.2);
        
        // setup initial movement state
        const movement = {
            angle: 0,
            radius: 50,
            rotationSpeed: 0.0005,
            verticalSpeed: 0.2,
            height: room.height * 11,
            centerPoint: new THREE.Vector3(0, room.height * 2, 0),
            lastDirection: new THREE.Vector3(),
            rotationOffset: Math.PI / 0.64
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
                // calculate spiral motion
                movement.angle += delta * movement.rotationSpeed;
                const x = movement.centerPoint.x + movement.radius * Math.cos(movement.angle);
                const z = movement.centerPoint.z + movement.radius * Math.sin(movement.angle);
                let y = movement.centerPoint.y + Math.sin(movement.angle * 0.5) * 40;
                
                // prevent bird from going below floor level
                const minHeight = 3; // minimum height above floor
                y = Math.max(y, minHeight);

                // store current position before update
                const previousPosition = bird.position.clone();
                
                // update position
                bird.position.set(x, y, z);
                
                // calculate direction for bird orientation
                const direction = bird.position.clone().sub(previousPosition).normalize();
                if (direction.lengthSq() > 0) {
                    movement.lastDirection.copy(direction);
                }
                
                // update bird orientation
                bird.lookAt(bird.position.clone().add(movement.lastDirection));
                bird.rotateY(Math.PI / 2 + movement.rotationOffset);

                mixer.update(delta);
            }
        });
    });
}

