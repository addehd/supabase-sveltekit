import { updateDescription, updateAudioSource, updateName } from './state/art-info';
import { artworkLoaded } from './stores/loading-store';

import * as THREE from 'three';
import VG from './vg';

const scaleFactor = 0.4;

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
      artworks.sort((a, b) => {
        return a.order - b.order;
      });
      positionArtwork(wall, artworks.map(art => art.object) as THREE.Mesh[], room);
    });
    
    // set the store to true when loading is complete
    artworkLoaded.set(true);
  });

  // update artwork description and audio url when player is near
  let lastUpdatedArtwork = null;
  let lastCheckTime = 0;
  const proximityThreshold = 30;
  const checkInterval = 1000;

  return (playerPosition: THREE.Vector3) => {
    const now = performance.now();
    if (now - lastCheckTime > checkInterval) {
      let playerNearArtwork = false;
      
      vg.scene.children.forEach((child) => {
        if (child.userData && child.userData.artwork) {
          
          const distance = playerPosition.distanceTo(child.position);
          
          if (distance < proximityThreshold) {
            playerNearArtwork = true;
            if (child !== lastUpdatedArtwork) {
              if (child.userData.artwork.description) {
                updateDescription(child.userData.artwork.description);
              }
              if (child.userData.artwork.audio && 
                  (!lastUpdatedArtwork?.userData.artwork.audio || 
                   lastUpdatedArtwork.userData.artwork.audio !== child.userData.artwork.audio)) {
                updateAudioSource(child.userData.artwork.audio);
              }
              
              if (child.userData.artwork.title) {
                updateName(child.userData.artwork.title);
              }

              lastUpdatedArtwork = child;
            }
          }
        }
      });

      if (!playerNearArtwork && lastUpdatedArtwork) {
        updateDescription('');
        updateAudioSource('');
        updateName('');
        lastUpdatedArtwork = null;
      }

      lastCheckTime = now;
    }
  };
}

function processImage(image: HTMLImageElement): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = image.width * scaleFactor;
  canvas.height = image.height * scaleFactor;

  ctx.filter = 'contrast(130%) brightness(70%)';
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height); // draw scaled image

  const processedTexture = new THREE.CanvasTexture(canvas);
  processedTexture.encoding = THREE.sRGBEncoding;
  return processedTexture;
}

function createAndAddArtwork(vg: VG, wallArtwork: any, artwork: any, processedTexture: THREE.CanvasTexture) {
  const geometry = createGeometry(processedTexture.image as HTMLImageElement);

  const material = new THREE.MeshBasicMaterial({
    map: processedTexture,
    transparent: true,
    opacity: 1,
  });

  const object = new THREE.Mesh(geometry, material);
  addArtworkToWall(wallArtwork, artwork, object);

  // create bounding box with larger interaction area
  const width = processedTexture.image.width * scaleFactor;
  const height = processedTexture.image.height * scaleFactor;
  const boundingBox = new THREE.Box3();
  
  object.userData = {
    artwork: artwork,
    boundingBox: boundingBox,
    dimensions: { width, height }
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

function createGeometry(image: HTMLImageElement): THREE.PlaneGeometry {
  const widthScalingFactor = 1;

  return new THREE.PlaneGeometry(
    (image.width / (scaleFactor * 100)) * 1.05,  // multiply by 1.05 to increase size
    (image.height / (scaleFactor * 100)) * 1.05  // multiply by 1.05 to increase size
  );
}

function addArtworkToWall(wallArtwork: any, artwork: any, object: THREE.Mesh) {
  const wall = artwork.wall.toLowerCase();
  if (wallArtwork[wall]) {
    wallArtwork[wall].push({ 
      object, 
      artwork_id: artwork.artwork_id,
      order: artwork.order 
    });
  } else {
    //console.error(`Invalid wall specified for artwork ${artwork.artwork_id}: ${artwork.wall}`);
  }
}

function positionArtwork(wall: string, artworks: THREE.Mesh[], room: { width: number, depth: number, height: number }, videoUrl?: string) {
    const floorY = 0;
    const heightAboveFloor = -0.4;
    const artworkYOffset = -1.5;
    const spacing = 0;
    
    // wall direction configuration
    const wallDirections = {
        north: 'ltr', // left to right
        south: 'rtl', // right to left
        east: 'ltr',  // right to left (back to front)
        west: 'rtl'   // left to right (front to back)
    };
    
    // determine start position and increment based on direction
    const direction = wallDirections[wall];
    const startX = direction === 'ltr'
        ? (wall === 'north' ? (-room.width / 2) + 15 : 
          wall === 'south' ? -room.width / 2 : 
          -room.depth / 2)
        : (wall === 'north' || wall === 'south' ? room.width / 2 : room.depth / 2);
    
    const increment = direction === 'ltr' ? 1 : -1;
    let currentX = startX;

    artworks.forEach((art) => {
        const width = art.geometry.parameters.width;
        const height = art.geometry.parameters.height;
        const yPosition = floorY + heightAboveFloor + height / 2 + artworkYOffset;
        
        // calculate position offset based on direction
        const xOffset = direction === 'ltr' ? width/2 : -width/2;

        switch (wall) {
            case 'north':
                art.position.set(currentX + xOffset, yPosition, -room.depth / 2 + 0.5);
                art.rotation.y = 0;
                break;
            case 'south':
                art.position.set(currentX + xOffset, yPosition, room.depth / 2 - 0.5);
                art.rotation.y = Math.PI;
                break;
            case 'east':
                art.position.set(room.width / 2 - 0.3, yPosition, currentX + xOffset);
                art.rotation.y = -Math.PI / 2;
                break;
            case 'west':
                art.position.set(-room.width / 2 + 0.1, yPosition, currentX + xOffset);
                art.rotation.y = Math.PI / 2;
                break;
        }

        // increment based on direction
        currentX += (width + spacing) * increment;
    });
}
