import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function setupBirds(vg, room) {
    console.log("Setting up birds detection system");
    const loader = new GLTFLoader();
    const raycaster = new THREE.Raycaster();
    const proximityThreshold = 150;
    
    // tracking which birds are visible to player
    const birdVisibility = {};

    // Single raycaster for all objects
    const visibilitySystem = {
        raycaster: new THREE.Raycaster(),
        lastCheckTime: 0,
        checkInterval: 200, // ms
        
        update: function(camera, objects, playerPosition) {
            const now = performance.now();
            if (now - this.lastCheckTime < this.checkInterval) return;
            this.lastCheckTime = now;
            
            // Single raycaster update
            this.raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
            
            // Filter objects by distance first (optimization)
            const nearbyObjects = objects.filter(obj => 
                obj.position.distanceTo(playerPosition) < proximityThreshold
            );
            
            // Single intersect call for all objects
            const intersects = this.raycaster.intersectObjects(nearbyObjects, true);
            
            // Process results
            const hitObjectIds = new Set(
                intersects.map(hit => hit.object.userData.id)
            );
            
            return hitObjectIds;
        }
    };

    // create bird with custom parameters
    const createBird = (params) => {
        console.log(`Loading bird ${params.id}`);
        loader.load('/seagull.glb', 
            // success callback
            (gltf) => {
                console.log(`Bird ${params.id} model loaded successfully`);
                const bird = gltf.scene.children[0];
                bird.scale.set(0.9, 0.9, 0.9);
                bird.position.set(10, 9, 0);
                
                // make the bird have a larger bounding box for easier detection
                const bbox = new THREE.Box3().setFromObject(bird);
                const size = new THREE.Vector3();
                bbox.getSize(size);
                
                // create an invisible box for better ray intersection
                const hitBox = new THREE.Mesh(
                    new THREE.BoxGeometry(size.x * 5, size.y * 5, size.z * 5),
                    new THREE.MeshBasicMaterial({ visible: false })
                );
                bird.add(hitBox);
                
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
                
                // add check proximity function to bird
                birdVisibility[`bird_${params.id}`] = false;
                
                vg.add({
                    name: `bird_${params.id}`,
                    object: bird,
                    frameCount: 0,
                    update: function(delta) {
                        // calculate spiral motion
                        movement.angle += delta * movement.rotationSpeed;
                        const x = movement.centerPoint.x + movement.radius * Math.cos(movement.angle);
                        const z = movement.centerPoint.z + movement.radius * Math.sin(movement.angle);
                        let y = movement.centerPoint.y + Math.sin(movement.angle * 0.5) * 40;
                        
                        // prevent bird from going below floor level
                        const minHeight = 37;
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
                        
                        // check proximity to player every few frames for performance
                        this.frameCount++;
                        if (this.frameCount % 10 !== 0) return;
                        
                        try {
                            const player = vg.things.find(thing => thing.name === 'player');
                            if (!player?.object) return;
                            
                            const playerPosition = player.object.position;
                            if (!playerPosition) return;
                            
                            const distance = bird.position.distanceTo(playerPosition);
                            
                            // update raycaster from camera
                            if (!vg.camera) {
                                console.error("Camera not found for raycasting");
                                return;
                            }
                            
                            raycaster.setFromCamera(new THREE.Vector2(0, 0), vg.camera);
                            
                            // check for intersection with bird
                            const intersects = raycaster.intersectObjects([bird, ...bird.children], true);
                            
                            // visible if within range and ray hits the bird
                            const isVisible = distance < proximityThreshold && intersects.length > 0;
                            const wasVisible = birdVisibility[`bird_${params.id}`];
                            
                            // debug data
                            if (this.frameCount % (10 * 5) === 0) {
                                console.log(`Bird ${params.id} - Distance: ${distance.toFixed(2)}, In view: ${intersects.length > 0}, Visible: ${isVisible}`);
                            }
                            
                            if (isVisible && !wasVisible) {
                                console.log(`Bird ${params.id} is now visible!`);
                                birdVisibility[`bird_${params.id}`] = true;
                            } else if (!isVisible && wasVisible) {
                                console.log(`Bird ${params.id} is no longer visible`);
                                birdVisibility[`bird_${params.id}`] = false;
                            }
                        } catch (error) {
                            console.error("Error in bird update:", error);
                        }
                    }
                });
            },
            // progress callback
            (xhr) => {
                console.log(`Bird ${params.id} loading: ${(xhr.loaded / xhr.total * 100).toFixed(0)}%`);
            },
            // error callback
            (error) => {
                console.error(`Error loading bird ${params.id}:`, error);
            }
        );
    };

    // create birds with different parameters
    createBird({
        id: 1,
        startAngle: 0,
        radius: 50,
        rotationSpeed: 0.0005,
        flyHeight: 40
    });

    createBird({
        id: 2,
        startAngle: Math.PI,
        radius: 65,
        rotationSpeed: 0.0004,
        flyHeight: 60
    });
    
    createBird({
        id: 3,
        startAngle: Math.PI / 2,
        radius: 105,
        rotationSpeed: 0.00026,
        flyHeight: 80
    });

    // create audio button and controls
    const audioButton = document.createElement('button');
    audioButton.innerHTML = '🔊';
    audioButton.style.position = 'absolute';
    audioButton.style.bottom = '27px';
    audioButton.style.left = '12.3%'; 
    audioButton.style.color = 'white';
    audioButton.style.zIndex = '1000';
    audioButton.style.fontSize = '1.7rem';
    document.body.appendChild(audioButton);

    const audio = new Audio('/seagull.mp3');
    audio.loop = true;
    
    audioButton.addEventListener('click', () => {
        if (audio.paused) {
            audio.currentTime = 0;
            audio.play().catch(e => console.error('Audio play failed:', e));
            audioButton.innerHTML = '🖕';
        } else {
            audio.pause();
            audioButton.innerHTML = '🔊';
        }
    });
}