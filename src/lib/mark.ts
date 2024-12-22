import * as THREE from "three";
import * as CANNON from "cannon-es";

// in mark.ts, modify the function signature and add vg.add:
export const setupMark = (
  vg: any,
  room: { width: number; depth: number; height: number },
  markMatrix: number[][]
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
};