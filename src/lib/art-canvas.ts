import { description, audioSource, updateDescription, updateAudioSource } from './state/art-info';

import * as THREE from 'three';
import VG from './vg';

export function setupArtwork(
    vg: VG, 
    textureLoader: THREE.TextureLoader, 
    data: any[], 
    room: {
    width: number,
    depth: number,
    height: number
  }) {
  
  const wallArtwork = {
    north: [],
    south: [],
    east: [],
    west: []
  };

  // use promises to ensure order
  const loadPromises = data.map((artwork) => {
    return new Promise < void > ((resolve, reject) => {
      textureLoader.load(artwork.image_url, (texture) => {
        const image = texture.image as HTMLImageElement;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = image.width;
        canvas.height = image.height;

        ctx.drawImage(image, 0, 0);
        ctx.filter = 'contrast(130%) brightness(70%)';
        ctx.drawImage(canvas, 0, 0);

        const processedTexture = new THREE.CanvasTexture(canvas);
        processedTexture.encoding = THREE.sRGBEncoding;

        const widthScalingFactor = 1;
        let scaleFactor = 1.03;
        if (artwork.wall.toLowerCase() === 'south') {
          scaleFactor = 0.97;
        }
        const geometry = new THREE.PlaneGeometry((image.width / 100) * widthScalingFactor * scaleFactor, (image.height / 100) * scaleFactor);
        
        const material = new THREE.MeshBasicMaterial({
          map: processedTexture,
          transparent: true,
          opacity: 1,
        });

        const object = new THREE.Mesh(geometry, material);
        const wall = artwork.wall.toLowerCase();
        if (wallArtwork[wall]) {
          wallArtwork[wall].push({
            object,
            artwork_id: artwork.artwork_id
          });
        } else {
          console.error(`Invalid wall specified for artwork ${artwork.artwork_id}: ${artwork.wall}`);
        }

        object.userData = {
          artwork: artwork,
          boundingSphere: new THREE.Sphere(object.position, Math.max(image.width, image.height) / 200 * scaleFactor)
        };

        vg.add({
          name: `${wall}Artwork`,
          object: object,
          showGui: false,
          gui: [
            [object.material, 'opacity', 0, 1, 0.01, 'Opacity']
          ]
        });

        resolve();
      }, undefined, (error) => {
        console.error(`Error loading texture for artwork: ${artwork.image_url}`, error);
        reject(error);
      });
    });
  });

  // wait for all textures to load before positioning
  Promise.all(loadPromises).then(() => {
    Object.entries(wallArtwork).forEach(([wall, artworks]) => {
      // Sort artworks by artwork_id before positioning
      artworks.sort((a, b) => a.artwork_id - b.artwork_id);
      positionArtwork(wall, artworks.map(art => art.object) as THREE.Mesh[], room);
    });
  });

  // return proximity to artworks
  let lastUpdatedArtwork = null;

  return (playerPosition: THREE.Vector3) => {
    vg.scene.children.forEach((child) => {
      if (child.userData && child.userData.artwork) {
        const boundingSphere = child.userData.boundingSphere;
        if (boundingSphere.containsPoint(playerPosition) && child !== lastUpdatedArtwork) {
          // update description and audio source
          updateDescription(child.userData.artwork.description);
          updateAudioSource(child.userData.artwork.audio);
          lastUpdatedArtwork = child;
          console.log('updated artwork:', child.userData);
          // log the update
          console.log('updated artwork:', child.userData.artwork.audio);
        }
      }
    });
  };
}

function positionArtwork(wall: string, artworks: THREE.Mesh[], room: {
  width: number,
  depth: number,
  height: number
}) {
  const floorY = 0;
  const heightAboveFloor = -0.4;
  const artworkYOffset = - 1.5;

  const spacing = 2; // spacing between artworks
  const totalWidth = artworks.reduce((sum, art) => sum + art.geometry.parameters.width, 0) + (artworks.length - 1) * spacing;
  let startX = -totalWidth / 2;

  artworks.forEach((art) => {
    const width = art.geometry.parameters.width;
    const height = art.geometry.parameters.height;
    const yPosition = floorY + heightAboveFloor + height / 2 + artworkYOffset;

    switch (wall) {
      case 'north':
        art.position.set(startX + 10 + width / 2, yPosition, -room.depth / 2 + 0.5);
        art.rotation.y = 0;
        break;
      case 'south':
        art.position.set(totalWidth / 2 - startX - (width + 42), yPosition, room.depth / 2 - 0.5);
        art.rotation.y = Math.PI;
        break;
      case 'east':
        art.position.set(room.width / 2 - 0.1, yPosition, (startX - 7.5)  + width / 2);
        art.rotation.y = -Math.PI / 2;
        break;
      case 'west':
        art.position.set(-room.width / 2 + 0.1, yPosition, startX + width / 2 + 15.5);
        art.rotation.y = Math.PI / 2;
        break;
    }

    startX += width 
  });
}
