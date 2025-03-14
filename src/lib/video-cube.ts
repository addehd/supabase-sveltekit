import * as THREE from 'three';
import { videoSource, videoIsPlaying } from './state/art-info';

export function setupVideo(room, vg, videoUrl = '/test.mp4') {
    // create video element first
    const video = document.createElement('video');
    video.src = videoUrl;
    video.loop = true;
    video.playsInline = true;
    video.width = 1400;
    video.height = 640;
    video.autoplay = false;

    // subscribe to video source changes after video element is created
    const unsubscribe = videoSource.subscribe(url => {
        console.log('Video source changed:', url);
        video.src = url;
        video.load();
    });

    // add subscription to videoIsPlaying store
    const unsubscribeVideo = videoIsPlaying.subscribe(isPlaying => {
        if (isPlaying) {
            video.play().catch(e => console.error('Play failed:', e));
            console.log('video is playing');
        } else {
            console.log('video is paused');
            video.pause();
        }
    });

    // play button
    const playButton = document.createElement('button');
    playButton.innerHTML = '▶️ Play video';
    playButton.style.position = 'fixed';
    playButton.style.bottom = '30px';
    playButton.style.left = '240px';
    playButton.style.zIndex = '1000';
    playButton.style.color = 'white';
    playButton.style.fontSize = '1.3rem';
    
    playButton.addEventListener('click', () => {
        if (video.paused) {
            video.play().catch(e => console.error('Play failed:', e));
            playButton.innerHTML = 'Pause ⏸️ ';
        } else {
            video.pause();
            playButton.innerHTML = 'Play ▶️';
        }
    });
    
    document.body.appendChild(playButton);

    video.addEventListener('error', (e) => {
      console.error('Video error:', video.error);
    });

    video.addEventListener('loadeddata', () => {
      console.log('Video loaded successfully');
    });

    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    
    const geometry = new THREE.PlaneGeometry(38, 20);
    const material = new THREE.MeshBasicMaterial({ 
        map: videoTexture,
        side: THREE.DoubleSide 
    });
    const videoMesh = new THREE.Mesh(geometry, material);
    videoMesh.position.set(-room.width/2 + 0.2, room.height * 1.7, -room.depth/2 + 21.7 );
    videoMesh.rotation.y = Math.PI/2;
    
    // add to scene
    vg.scene.add(videoMesh);

    const proximityThreshold = 100;
    let wasVisible = false;
    const raycaster = new THREE.Raycaster();
    
    videoMesh.userData.checkProximity = (playerPosition, camera) => {
        const distance = videoMesh.position.distanceTo(playerPosition);
        
        // update raycaster from camera
        raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
        
        // check for intersection with video mesh
        const intersects = raycaster.intersectObject(videoMesh);
        
        if (intersects.length > 0 && distance < proximityThreshold) {
            playButton.style.display = 'block';
        } else {
            playButton.style.display = 'none';
        }

        
        // visible if within range and ray hits the video
        const isVisible = distance < proximityThreshold && intersects.length > 0;
        
        if (isVisible && !wasVisible) {
            console.log('video is now visible');
            wasVisible = true;
        } else if (!isVisible && wasVisible) {
            console.log('video is no longer visible');
            wasVisible = false;
        }
    };

    vg.add({
        name: 'videoScreen',
        object: videoMesh,
        update: function(delta) {
            if (this.frameCount === undefined) this.frameCount = 0;
            this.frameCount++;
            if (this.frameCount % 5 !== 0) return;

            const player = vg.things.find(thing => thing.name === 'player');
            if (player?.object) {
                this.object.userData.checkProximity(
                    player.object.position,
                    vg.camera
                );
            }
        }
    });
}