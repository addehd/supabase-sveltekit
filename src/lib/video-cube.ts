import * as THREE from 'three';
import { videoSource, videoIsPlaying } from './state/art-info';

// video configuration
const VIDEO_CONFIG = {
  width: 35,         // width of video plane 
  height: 20,        // height of video plane
  htmlWidth: 1400,   // width of html video element
  htmlHeight: 640,   // height of html video element
  position: {
    x: -0.6,          // offset from wall (increase to move right)
    y: 1.6,          // multiplier for room height 
    z: 22          // offset from depth
  }
};

// create a client-side proxy for video URLs
function createVideoProxy(url) {
  // if already a local URL, return as is
  if (url.startsWith('/')) {
    return url;
  }
  
  // for known working URLs, return as is
  if (url.includes('storage.googleapis.com')) {
    return url;
  }
  
  // create a video element to proxy the content
  const proxyVideo = document.createElement('video');
  proxyVideo.style.display = 'none';
  proxyVideo.crossOrigin = 'anonymous';
  proxyVideo.src = url;
  proxyVideo.muted = true; // no longer needed for autoplay but keeping for safety
  proxyVideo.loop = true;
  document.body.appendChild(proxyVideo);
  
  // create a canvas element
  const canvas = document.createElement('canvas');
  canvas.width = VIDEO_CONFIG.htmlWidth;
  canvas.height = VIDEO_CONFIG.htmlHeight;
  canvas.style.display = 'none';
  document.body.appendChild(canvas);
  
  const ctx = canvas.getContext('2d');
  
  // start drawing frames from the proxy video to the canvas
  setInterval(() => {
    if (proxyVideo.readyState >= 2 && !proxyVideo.paused) {
      try {
        ctx.drawImage(proxyVideo, 0, 0, canvas.width, canvas.height);
      } catch (e) { 
        console.error('Canvas draw error:', e);
      }
    }
  }, 16); // ~60fps
  
  // return the canvas element for the texture
  return { canvas, proxyVideo };
}

export function setupVideo(room, vg, videoUrl = '/test.mp4') {
    // create video element first
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous'; // set crossOrigin before src
    video.src = videoUrl;
    video.loop = true;
    video.playsInline = true;
    video.width = VIDEO_CONFIG.htmlWidth;
    video.height = VIDEO_CONFIG.htmlHeight;
    video.autoplay = false;
    
    // track if we're using the proxy approach
    let proxyData = null;
    let usingProxy = false;
    
    // Function to play video for 2 seconds then pause
    const playForTwoSeconds = (videoElement) => {
      if (videoElement) {
        videoElement.play().then(() => {
          // set timeout to pause after 2 seconds
          setTimeout(() => {
            videoElement.pause();
            // update play button state
            playButton.innerHTML = ' ▶️';
            // update store state
            videoIsPlaying.set(false);
          }, 2000);
        }).catch(e => {
          console.error('Play failed:', e);
        });
      }
    };
    
    // subscribe to video source changes after video element is created
    const unsubscribe = videoSource.subscribe(url => {
        console.log('Video source changed:', url);
        video.crossOrigin = 'anonymous'; // ensure crossOrigin is set before changing src
        video.src = url;
        video.load();
        
        // wait for video to load then play for 2 seconds
        video.addEventListener('loadeddata', function onceLoaded() {
          // play for 2 seconds once loaded
          playForTwoSeconds(video);
          // remove event listener after first load
          video.removeEventListener('loadeddata', onceLoaded);
        }, { once: true });
        
        // set a timeout to check if video loads correctly
        setTimeout(() => {
            if (video.videoWidth === 0 || video.error) {
                console.log('Video not loading correctly, trying proxy approach');
                // try proxy approach
                proxyData = createVideoProxy(url);
                usingProxy = true;
                
                if (proxyData.proxyVideo) {
                    // sync play state
                    proxyData.proxyVideo.loop = true;
                    
                    // play for 2 seconds
                    playForTwoSeconds(proxyData.proxyVideo);
                    
                    // update texture to use canvas
                    if (proxyData.canvas && videoTexture) {
                        videoTexture.image = proxyData.canvas;
                        videoTexture.needsUpdate = true;
                    }
                }
            }
        }, 2000);
    });
    
    // add subscription to videoIsPlaying store
    const unsubscribeVideo = videoIsPlaying.subscribe(isPlaying => {
        if (isPlaying) {
            if (usingProxy && proxyData?.proxyVideo) {
                proxyData.proxyVideo.play().catch(e => console.error('Proxy play failed:', e));
            } else {
                video.play().catch(e => console.error('Play failed:', e));
            }
            console.log('video is playing');
        } else {
            console.log('video is paused');
            if (usingProxy && proxyData?.proxyVideo) {
                proxyData.proxyVideo.pause();
            } else {
                video.pause();
            }
        }
    });

    // play button
    const playButton = document.createElement('button');
    playButton.innerHTML = '▶️';
    playButton.style.position = 'fixed';
    playButton.style.bottom = '29px';
    playButton.style.left = '240px';
    playButton.style.zIndex = '1000';
    playButton.style.color = 'white';
    playButton.style.fontSize = '1.6rem';
    
    playButton.addEventListener('click', () => {
        if ((usingProxy && proxyData?.proxyVideo?.paused) || (!usingProxy && video.paused)) {
            if (usingProxy && proxyData?.proxyVideo) {
                proxyData.proxyVideo.play().catch(e => console.error('Proxy play failed:', e));
            } else {
                video.play().catch(e => console.error('Play failed:', e));
            }
            playButton.innerHTML = ' ⏸️ ';
        } else {
            if (usingProxy && proxyData?.proxyVideo) {
                proxyData.proxyVideo.pause();
            } else {
                video.pause();
            }
            playButton.innerHTML = ' ▶️';
        }
    });
    
    document.body.appendChild(playButton);

    video.addEventListener('error', (e) => {
      console.error('Video error:', video.error, video.error?.code, video.error?.message);
      console.error('Video source:', video.src);
      console.error('Cross-origin issues may prevent the video from loading properly');
    });

    video.addEventListener('loadeddata', () => {
      console.log('Video loaded successfully');
      // Test if video is actually playable by checking dimensions
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        console.error('Video loaded but dimensions are zero - possible CORS issue');
        
        // Try to create a backup canvas-based approach for CORS videos
        try {
          proxyData = createVideoProxy(video.src);
          usingProxy = true;
          
          // Start canvas updates
          if (proxyData?.canvas) {
            videoTexture.image = proxyData.canvas;
            videoTexture.needsUpdate = true;
          }
        } catch (e) {
          console.error('Canvas fallback failed:', e);
        }
      } else {
        console.log('Video dimensions:', video.videoWidth, 'x', video.videoHeight);
      }
    });

    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    
    // setup rendering loop to update texture if using proxy
    const updateTexture = () => {
      if (usingProxy && videoTexture) {
        videoTexture.needsUpdate = true;
      }
      requestAnimationFrame(updateTexture);
    };
    updateTexture();
    
    const geometry = new THREE.PlaneGeometry(VIDEO_CONFIG.width, VIDEO_CONFIG.height);
    const material = new THREE.MeshBasicMaterial({ 
        map: videoTexture,
        side: THREE.DoubleSide 
    });
    const videoMesh = new THREE.Mesh(geometry, material);
    videoMesh.position.set(
        -room.width/2 + VIDEO_CONFIG.position.x, 
        room.height * VIDEO_CONFIG.position.y, 
        -room.depth/2 + VIDEO_CONFIG.position.z
    );
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