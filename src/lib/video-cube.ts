import * as THREE from 'three';

export function setupVideo(room, vg, videoUrl = '/test.mp4') {
    // create video element
    const video = document.createElement('video');
    video.src = videoUrl;
    video.loop = true;
    video.playsInline = true;
    video.width = 1820;
    video.height = 820;

    
    video.addEventListener('error', (e) => {
      console.error('Video error:', video.error);
    });

    video.addEventListener('loadeddata', () => {
      console.log('Video loaded successfully');
    });

    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    
    const geometry = new THREE.PlaneGeometry(52, 45.5);
    const material = new THREE.MeshBasicMaterial({ 
        map: videoTexture,
        side: THREE.DoubleSide 
    });
    const videoMesh = new THREE.Mesh(geometry, material);
    // position video at end of west wall (north end)
    //videoMesh.position.set(-room.width/2 - 0.5, room.height * 1.2, room.depth/2 - 40);

    videoMesh.position.set(-room.width/2 - 0.5, room.height * 1.2, -room.depth/2 + 40);
    videoMesh.rotation.y = Math.PI/2;
    
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