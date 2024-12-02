import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function setupBirds(vg, room) {
    const loader = new GLTFLoader();

    // create bird with custom parameters
    const createBird = (params) => {
        loader.load('/Parrot.glb', (gltf) => {
            const bird = gltf.scene.children[0];
            bird.scale.set(0.1, 0.1, 0.1);
            
            // setup movement state
            const movement = {
                angle: params.startAngle,
                radius: params.radius,
                rotationSpeed: params.rotationSpeed,
                verticalSpeed: 0.2,
                height: room.height * 20,
                centerPoint: new THREE.Vector3(0, room.height * 4, 0),
                lastDirection: new THREE.Vector3(),
                rotationOffset: Math.PI / 0.64
            };

            // animation mixer setup
            const mixer = new THREE.AnimationMixer(bird);
            const clips = gltf.animations;
            if (clips.length > 0) {
                const action = mixer.clipAction(clips[0]);
                action.timeScale = 0.00099;
                action.play();
            }

            vg.add({
                name: `bird_${params.id}`,
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
    };

    // create two birds with different parameters
    createBird({
        id: 1,
        startAngle: 0,
        radius: 50,
        rotationSpeed: 0.0005
    });

    createBird({
        id: 2,
        startAngle: Math.PI, // start on opposite side
        radius: 65,          // slightly larger radius
        rotationSpeed: 0.0004 // slightly slower
    });
    createBird({
        id: 3,
        startAngle: Math.PI / 2, // start on opposite side
        radius: 25,          // slightly larger radius
        rotationSpeed: 0.0004 // slightly slower
    });
}

