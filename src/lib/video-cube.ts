import * as THREE from 'three';

export function setupVideo(room, vg, videoUrl = '/test.mp4') {
    // create video element
    const video = document.createElement('video');
    video.src = videoUrl;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;

    
    // add error handling
    video.addEventListener('error', (e) => {
      console.error('Video error:', video.error);
    });

    video.addEventListener('loadeddata', () => {
      console.log('Video loaded successfully');
    });

    // create video texture
    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    
    // create video plane
    const geometry = new THREE.PlaneGeometry(80, 60);
    const material = new THREE.MeshBasicMaterial({ 
        map: videoTexture,
        side: THREE.DoubleSide 
    });
    const videoMesh = new THREE.Mesh(geometry, material);
    videoMesh.position.set(-room.width * 0.4, room.height / 2, -room.depth / 2 + 0.7  );
    
    // add to scene
    vg.scene.add(videoMesh);

    // start video
    video.load();
    video.play().catch(e => console.error('Play failed:', e));

    vg.add({
        name: 'videoScreen',
        object: videoMesh
    });

    // cleanup function
    return () => {
        vg.scene.remove(videoMesh);
        videoTexture.dispose();
        video.remove();
    };
}