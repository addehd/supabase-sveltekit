import * as THREE from 'three';

export function setupVideo(room, vg, videoUrl = '/test.mp4') {
    // create video element
    const video = document.createElement('video');
    video.src = videoUrl;
    video.loop = true;
    video.playsInline = true;
    video.width = 1400;
    video.height = 640;
    // start paused
    video.autoplay = false;
    
    // create play buttona
    const playButton = document.createElement('button');
    playButton.innerHTML = '▶️ Play';
    playButton.style.position = 'fixed';
    playButton.style.bottom = '40px';
    playButton.style.left = '80px';
    playButton.style.zIndex = '1000';
    playButton.style.color = 'white';
    
    playButton.addEventListener('click', () => {
        if (video.paused) {
            video.play().catch(e => console.error('Play failed:', e));
            playButton.innerHTML = '⏸️ Pause';
        } else {
            video.pause();
            playButton.innerHTML = '▶️ Play';
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
    
    const geometry = new THREE.PlaneGeometry(42, 20);
    const material = new THREE.MeshBasicMaterial({ 
        map: videoTexture,
        side: THREE.DoubleSide 
    });
    const videoMesh = new THREE.Mesh(geometry, material);
    // position video higher on wall
    videoMesh.position.set(-room.width/2 + 0.2, room.height * 1.7, -room.depth/2 + 25 );
    videoMesh.rotation.y = Math.PI/2;
    
    // add to scene
    vg.scene.add(videoMesh);

    // start video
    //video.load();
    //video.play().catch(e => console.error('Play failed:', e));

    vg.add({
        name: 'videoScreen',
        object: videoMesh
    });

    // cleanup function
    return () => {
        vg.scene.remove(videoMesh);
        videoTexture.dispose();
        video.remove();
        playButton.remove();
    };
}