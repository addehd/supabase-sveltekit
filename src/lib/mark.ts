import * as THREE from "three";
import * as CANNON from "cannon-es";
import { createScene } from './solo';

// reference to solo for later use
let solo: any = null;

// reference to /solo path
const soloPath = '/solo/11';

// in mark.ts, modify the function signature and add vg.add:
export const setupMark = (
  vg: any,
  room: { width: number; depth: number; height: number },
  markMatrix: number[][],
  player: { position: THREE.Vector3 }
) => {
  const textureLoader = new THREE.TextureLoader();
  const markTexture = textureLoader.load("/x.webp");

  // find mark position from matrix
  let markX = 0, markZ = 0;
  for(let i = 0; i < markMatrix.length; i++) {
    for(let j = 0; j < markMatrix[i].length; j++) {
      if(markMatrix[i][j] === 1) {
        markX = (j - markMatrix[i].length/2) * (room.width/markMatrix[i].length);
        markZ = (i - markMatrix.length/2) * (room.depth/markMatrix.length);
      }
    }
  }

  const geometry = new THREE.PlaneGeometry(11,11);
  const material = new THREE.MeshBasicMaterial({
    map: markTexture,
    transparent: true,
    side: THREE.DoubleSide
  });

  const object = new THREE.Mesh(geometry, material);
  
  const matrix = new THREE.Matrix4();
  matrix.makeRotationX(-Math.PI / 2);
  matrix.multiply(new THREE.Matrix4().makeRotationZ(Math.PI / 2));
  matrix.setPosition(markX, -room.height / 2 + 1.1, markZ);
  object.applyMatrix4(matrix);

  const mark = {
    name: 'mark',
    object: object,
    gui: [
      [ object.position, 'x', -10, 10, 1, 'x' ],
      [ object.position, 'y', -10, 10, 1, 'y' ],
      [ object.position, 'z', -10, 10, 1, 'z' ],
    ]
  };

  vg.add(mark);


  const checkPlayerAboveMark = (playerPosition: THREE.Vector3) => {
    const markX = object.position.x;
    const markZ = object.position.z;
    const emojiId = 'apple-emoji';
    
    if (Math.abs(playerPosition.x - markX) < 3 && Math.abs(playerPosition.z - markZ) < 3) {
      // player is above the mark
      if (!document.getElementById(emojiId)) {
        // create link that wraps the emoji
        const link = document.createElement('a');
        link.href = soloPath;
        link.setAttribute('data-sveltekit-reload', '');
        link.style.textDecoration = 'none';
        link.style.position = 'fixed';
        link.style.bottom = '22px';
        link.style.left = '28%';
        link.style.transform = 'translateX(-50%)';
        link.style.zIndex = '1000';
        link.dataset.timestamp = Date.now().toString();
        link.id = emojiId;
        
        // create the emoji inside the link
        const emoji = document.createElement('span');
        emoji.textContent = '🍎';
        emoji.style.fontSize = '28px';
        
        link.appendChild(emoji);
        document.body.appendChild(link);
      }
    } else {
      // check if emoji exists and has been there less than 30 seconds
      const link = document.getElementById(emojiId);
      if (link) {
        const timestamp = parseInt(link.dataset.timestamp || '0');
        const currentTime = Date.now();
        
        if (currentTime - timestamp >= 30000) {
          document.body.removeChild(link);
        }
      }
    }
  };

  // return the check function for external use
  return checkPlayerAboveMark;
};