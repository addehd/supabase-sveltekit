import { updateDescription, updateAudioSource } from './state/art-info';

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

  const loadingManager = new THREE.LoadingManager();
  const processedTextures = new Map();

  const loadPromises = data.map((artwork) => {
    return new Promise<void>((resolve, reject) => {
      if (processedTextures.has(artwork.image_url)) {
        // use cached texture if available
        const processedTexture = processedTextures.get(artwork.image_url);
        createAndAddArtwork(vg, wallArtwork, artwork, processedTexture);
        resolve();
      } else {
        textureLoader.load(artwork.image_url, (texture) => {
          const image = texture.image as HTMLImageElement;
          const processedTexture = processImage(image);
          processedTextures.set(artwork.image_url, processedTexture);
          
          createAndAddArtwork(vg, wallArtwork, artwork, processedTexture);
          resolve();
        }, undefined, (error) => {
          console.error(`Error loading texture for artwork: ${artwork.image_url}`, error);
          reject(error);
        });
      }
    });
  });

  // wait for all textures to load before positioning
  Promise.all(loadPromises).then(() => {
    Object.entries(wallArtwork).forEach(([wall, artworks]) => {
      artworks.sort((a, b) => a.artwork_id - b.artwork_id);
      positionArtwork(wall, artworks.map(art => art.object) as THREE.Mesh[], room);
    });
  });

  let lastUpdatedArtwork = null;
  let lastCheckTime = 0;
  const checkInterval = 1000;

  return (playerPosition: THREE.Vector3) => {
    const now = performance.now();

    if (now - lastCheckTime > checkInterval) {
      vg.scene.children.forEach((child) => {
        if (child.userData && child.userData.artwork) {
          const boundingSphere = child.userData.boundingSphere;
          boundingSphere.center.copy(child.position);
          
          if (boundingSphere.containsPoint(playerPosition) && child !== lastUpdatedArtwork) {
            if (child.userData.artwork.description) {
              updateDescription(child.userData.artwork.description);
            }
            if (child.userData.artwork.audio && 
                (!lastUpdatedArtwork?.userData.artwork.audio || 
                 lastUpdatedArtwork.userData.artwork.audio !== child.userData.artwork.audio)) {
              updateAudioSource(child.userData.artwork.audio);
            }
            lastUpdatedArtwork = child;
          }
        }
      });
      lastCheckTime = now;
    }
  };
}

function processImage(image: HTMLImageElement): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = image.width;
  canvas.height = image.height;

  ctx.filter = 'contrast(130%) brightness(70%)';
  ctx.drawImage(image, 0, 0);

  const processedTexture = new THREE.CanvasTexture(canvas);
  processedTexture.encoding = THREE.sRGBEncoding;
  return processedTexture;
}

function createAndAddArtwork(vg: VG, wallArtwork: any, artwork: any, processedTexture: THREE.CanvasTexture) {
  const scaleFactor = artwork.wall.toLowerCase() === 'south' ? 0.97 : 1.03;
  const geometry = createGeometry(processedTexture.image as HTMLImageElement, scaleFactor);

  const material = new THREE.MeshBasicMaterial({
    map: processedTexture,
    transparent: true,
    opacity: 1,
  });

  const object = new THREE.Mesh(geometry, material);
  addArtworkToWall(wallArtwork, artwork, object);

  object.userData = {
    artwork: artwork,
    boundingSphere: new THREE.Sphere(object.position, Math.max(processedTexture.image.width, processedTexture.image.height) / 200 * scaleFactor)
  };

  vg.add({
    name: `${artwork.wall.toLowerCase()}Artwork`,
    object: object,
    showGui: false,
    gui: [
      [object.material, 'opacity', 0, 1, 0.01, 'Opacity']
    ]
  });
}

function createGeometry(image: HTMLImageElement, scaleFactor: number): THREE.PlaneGeometry {
  const widthScalingFactor = 1;
  return new THREE.PlaneGeometry(
    (image.width / 100) * widthScalingFactor * scaleFactor,
    (image.height / 100) * scaleFactor
  );
}

function addArtworkToWall(wallArtwork: any, artwork: any, object: THREE.Mesh) {
  const wall = artwork.wall.toLowerCase();
  if (wallArtwork[wall]) {
    wallArtwork[wall].push({ object, artwork_id: artwork.artwork_id });
  } else {
    //console.error(`Invalid wall specified for artwork ${artwork.artwork_id}: ${artwork.wall}`);
  }
}

function positionArtwork(wall: string, artworks: THREE.Mesh[], room: { width: number, depth: number, height: number }, videoUrl?: string) {
    const floorY = 0;
    const heightAboveFloor = -0.4;
    const artworkYOffset = -1.5;
    const spacing = 0;

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
                art.position.set(startX + width / 2, yPosition, room.depth / 2 - 0.5);
                art.rotation.y = Math.PI;
                break;
            case 'east':
                art.position.set(room.width / 2 - 0.1, yPosition, (startX - 7.5) + width / 2);
                art.rotation.y = -Math.PI / 2;
                break;
            case 'west':
                art.position.set(-room.width / 2 + 0.1, yPosition, startX + width / 2 + 15.5);
                art.rotation.y = Math.PI / 2;
                break;
        }

        // console.log(`Artwork on ${wall} wall:`, {
        //     id: art.userData?.artwork?.artwork_id,
        //     position: art.position.toArray(),
        //     dimensions: {
        //         width: width,
        //         height: height
        //     },
        //     rotation: art.rotation.y
        // });

        startX += width + spacing;
    });
}
