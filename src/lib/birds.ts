import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function setupBirds(vg, room) {
    const loader = new GLTFLoader();

    // create bird with custom parameters
    const createBird = (params) => {
        loader.load('/seagull.glb', (gltf) => {
            const bird = gltf.scene.children[0];
            bird.scale.set(0.9, 0.9, 0.9);
            bird.position.set(10, 9, 0);
            
            // setup movement state
            const movement = {
                angle: params.startAngle,
                radius: params.radius,
                rotationSpeed: params.rotationSpeed,
                verticalSpeed: 0.2,
                height: params.flyHeight || room.height * 30,
                centerPoint: new THREE.Vector3(0, params.flyHeight || room.height * 4, 0),
                lastDirection: new THREE.Vector3(),
                rotationOffset: 0.2,
                zRotation: 1.0,
                xRotation: 0.733
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
                    const minHeight =13; // minimum height above floor
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
                    bird.rotateY(movement.rotationOffset * Math.PI * 2);
                    bird.rotateZ(movement.zRotation * Math.PI * 2);
                    bird.rotateX(movement.xRotation * Math.PI * 2);

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
        rotationSpeed: 0.0005,
        flyHeight: 40
    });

    createBird({
        id: 2,
        startAngle: Math.PI, // start on opposite side
        radius: 65,          // slightly larger radius
        rotationSpeed: 0.0004, // slightly slower
        flyHeight: 60
    });
    createBird({
        id: 3,
        startAngle: Math.PI / 2, // start on opposite side
        radius: 105,          // slightly larger radius
        rotationSpeed: 0.00026, // slightly slower
        flyHeight: 80
    });

    // create audio button and controls
    const audioButton = document.createElement('button');
    audioButton.innerHTML = '🔊 Sound';
    audioButton.style.position = 'absolute';
    audioButton.style.bottom = '30px';
    audioButton.style.left = '40px'; 
    audioButton.style.color = 'white';
    audioButton.style.zIndex = '1000';
    audioButton.style.fontSize = '1.3rem';
    document.body.appendChild(audioButton);

    const audio = new Audio('/seagull.mp3'); // replace with your audio file path
    audio.loop = true; // enable audio looping
    
    audioButton.addEventListener('click', () => {
        if (audio.paused) {
            audio.currentTime = 0; // reset audio to start
            audio.play().catch(e => console.error('Audio play failed:', e));
            audioButton.innerHTML = '🖕 Seagulls';
        } else {
            audio.pause();
            audioButton.innerHTML = '� Play Sound';
        }
    });
}

