import { updateDescription, updateAudioSource, updateName } from './state/art-info';
import { artworkLoaded } from './stores/loading-store';

import * as THREE from 'three';
import VG from './vg';

const scaleFactor = 0.3;

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
        // check if the url is an svg
        const isSvg = artwork.image_url.toLowerCase().endsWith('.svg');
        
        if (isSvg) {
          // handle svg loading
          loadSvg(artwork.image_url).then(svgTexture => {
            processedTextures.set(artwork.image_url, svgTexture);
            createAndAddArtwork(vg, wallArtwork, artwork, svgTexture);
            resolve();
          }).catch(error => {
            console.error(`Error loading SVG for artwork: ${artwork.image_url}`, error);
            reject(error);
          });
        } else {
          // handle regular image loading
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
      }
    });
  });

  // wait for all textures to load before positioning
  Promise.all(loadPromises).then(() => {
    Object.entries(wallArtwork).forEach(([wall, artworks]) => {
      // debug the pre-sorted array (for south wall)
      if (wall === 'south') {
        console.log('before sorting:', artworks.map(a => ({ id: a.artwork_id, order: a.order })));
      }
      
      // sort by order property
      artworks.sort((a, b) => {
        return a.order - b.order;
      });
      
      // debug the sorted array (for south wall)
      if (wall === 'south') {
        console.log('after sorting:', artworks.map(a => ({ id: a.artwork_id, order: a.order })));
      }
      
      positionArtwork(wall, artworks.map(art => art.object) as THREE.Mesh[], room);
    });
    
    // set the store to true when loading is complete
    artworkLoaded.set(true);
  });

  // update artwork description and audio url when player is near
  let lastUpdatedArtwork = null;
  let lastCheckTime = 0;
  const proximityThreshold = 60;
  const checkInterval = 1000;

  return (playerPosition: THREE.Vector3) => {
    const now = performance.now();
    if (now - lastCheckTime > checkInterval) {
      let playerNearArtwork = false;
      let closestArtwork = null;
      let closestDistance = Infinity;
      
      // first pass: find the closest artwork
      vg.scene.children.forEach((child) => {
        if (child.userData && child.userData.artwork) {
          const distance = playerPosition.distanceTo(child.position);
          
          if (distance < proximityThreshold && distance < closestDistance) {
            closestDistance = distance;
            closestArtwork = child;
            playerNearArtwork = true;
          }
        }
      });
      
      // update UI only if closest artwork changed
      if (playerNearArtwork && closestArtwork !== lastUpdatedArtwork) {
        if (closestArtwork.userData.artwork.description) {
          updateDescription(closestArtwork.userData.artwork.description);
        }
        if (closestArtwork.userData.artwork.audio && 
            (!lastUpdatedArtwork?.userData.artwork.audio || 
             lastUpdatedArtwork.userData.artwork.audio !== closestArtwork.userData.artwork.audio)) {
          updateAudioSource(closestArtwork.userData.artwork.audio);
        }
        
        if (closestArtwork.userData.artwork.title) {
          updateName(closestArtwork.userData.artwork.title);
        }

        lastUpdatedArtwork = closestArtwork;
      }

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
    (image.width / (scaleFactor * 100)) * 1.075,  // multiply by 1.05 to increase size
    (image.height / (scaleFactor * 100)) * 1.075  // multiply by 1.05 to increase size
  );
}

function addArtworkToWall(wallArtwork: any, artwork: any, object: THREE.Mesh) {
  const wall = artwork.wall.toLowerCase();
  if (wallArtwork[wall]) {
    // ensure artwork has a valid order property
    if (artwork.order === undefined || artwork.order === null || artwork.order === 0) {
      // if multiple artworks have order 0, assign a sequential order based on position in array
      artwork.order = wallArtwork[wall].length + 1;
    }
    
    wallArtwork[wall].push({ 
      object, 
      artwork_id: artwork.artwork_id,
      order: artwork.order 
    });
    
    // log for debugging
    if (wall === 'south') {
      console.log(`added south artwork ${artwork.artwork_id} with order ${artwork.order}`);
    }
  } else {
    //console.error(`Invalid wall specified for artwork ${artwork.artwork_id}: ${artwork.wall}`);
  }
}

function positionArtwork(wall: string, artworks: THREE.Mesh[], room: { width: number, depth: number, height: number }, videoUrl?: string) {
    const floorY = 0;
    const heightAboveFloor = -0.4;
    const artworkYOffset = -1.7;
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

    // add debug logging to help track ordering issues
    if (wall === 'south') {
      console.log('positioning south wall artworks:', artworks.map(art => art.userData?.artwork?.order));
    }

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
                art.position.set(-room.width / 1.96 , yPosition, currentX + xOffset);
                art.rotation.y = Math.PI / 2;
                break;
        }

        // increment based on direction
        currentX += (width + spacing) * increment;
    });
}

// new function to load and process SVGs
function loadSvg(url: string): Promise<THREE.CanvasTexture> {
  return new Promise((resolve, reject) => {
    // fetch the svg file
    fetch(url)
      .then(response => response.text())
      .then(svgData => {
        // create a blob from the svg data
        const blob = new Blob([svgData], {type: 'image/svg+xml'});
        const blobUrl = URL.createObjectURL(blob);
        
        // create a new image to render the svg
        const img = new Image();
        img.onload = () => {
          // create a canvas to render the svg
          const canvas = document.createElement('canvas');
          // set reasonable default dimensions for svg
          const defaultWidth = 800;
          const defaultHeight = 600;
          
          // extract width and height from svg if possible
          const parser = new DOMParser();
          const svgDoc = parser.parseFromString(svgData, 'image/svg+xml');
          const svgElement = svgDoc.querySelector('svg');
          
          let width = defaultWidth;
          let height = defaultHeight;
          
          if (svgElement) {
            // try to get width and height attributes
            const svgWidth = svgElement.getAttribute('width');
            const svgHeight = svgElement.getAttribute('height');
            
            // try to get viewBox if width/height not specified
            if ((!svgWidth || !svgHeight) && svgElement.getAttribute('viewBox')) {
              const viewBox = svgElement.getAttribute('viewBox').split(' ');
              if (viewBox.length === 4) {
                width = parseFloat(viewBox[2]);
                height = parseFloat(viewBox[3]);
              }
            } else {
              // parse width and height if available
              if (svgWidth) width = parseFloat(svgWidth);
              if (svgHeight) height = parseFloat(svgHeight);
            }
          }
          
          // apply scale factor
          canvas.width = width * scaleFactor;
          canvas.height = height * scaleFactor;
          
          const ctx = canvas.getContext('2d');
          // apply same filters as for images
          ctx.filter = 'contrast(130%) brightness(70%)';
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          // create texture from canvas
          const svgTexture = new THREE.CanvasTexture(canvas);
          svgTexture.encoding = THREE.sRGBEncoding;
          
          // clean up blob url
          URL.revokeObjectURL(blobUrl);
          
          resolve(svgTexture);
        };
        
        img.onerror = (error) => {
          URL.revokeObjectURL(blobUrl);
          reject(`Failed to load SVG: ${error}`);
        };
        
        // set src to start loading
        img.src = blobUrl;
      })
      .catch(error => {
        reject(`Error fetching SVG: ${error}`);
      });
  });
}
