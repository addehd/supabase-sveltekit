import * as THREE from 'three';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import { get } from 'svelte/store';
import { videoElement, videoSource } from '$lib/stores/video-store';

export function setupVideo(room, vg) {
    // create div container for iframe
    const div = document.createElement('div');
    div.style.width = '480px';
    div.style.height = '360px';
    div.style.backgroundColor = '#000';

    // create iframe
    const iframe = document.createElement('iframe');
    iframe.style.width = '480px';
    iframe.style.height = '360px';
    iframe.style.border = '0px';
    iframe.src = get(videoSource);
    div.appendChild(iframe);

    // create CSS3D object
    const videoObject = new CSS3DObject(div);
    videoObject.position.set(0, room.height / 2, -room.depth / 3);
    
    // add to scene
    vg.scene.add(videoObject);

    vg.add({
        name: 'videoScreen',
        object: videoObject
    });

    // cleanup function
    return () => {
        vg.scene.remove(videoObject);
        div.remove();
    };
}
  