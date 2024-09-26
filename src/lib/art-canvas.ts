import * as THREE from 'three';
import VG from './vg';

export async function setupArtwork(vg: VG, textureLoader: THREE.TextureLoader, data: any[], room: { width: number, depth: number, height: number }) {
  const wallArtwork = {
    north: [],
    south: [],
    east: [],
    west: []
  };

  const loadTexture = (url: string) => new Promise<THREE.Texture>((resolve, reject) => {
    textureLoader.load(url, resolve, undefined, reject);
  });

  const setupArtworkPromises = data.map(async (artwork) => {
    try {
      const texture = await loadTexture(artwork.image_url);
      const image = texture.image as HTMLImageElement;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = image.width;
      canvas.height = image.height;

      ctx.drawImage(image, 0, 0);
      ctx.filter = 'contrast(150%) brightness(70%)';
      ctx.drawImage(canvas, 0, 0);

      const processedTexture = new THREE.CanvasTexture(canvas);
      processedTexture.encoding = THREE.sRGBEncoding;

      const width = image.width / 100;
      const height = image.height / 100;

      const geometry = new THREE.PlaneGeometry(width, height);
      const material = new THREE.MeshBasicMaterial({
        map: processedTexture,
        transparent: true,
        opacity: 0.8,
      });

      const object = new THREE.Mesh(geometry, material);
      const wall = artwork.wall.toLowerCase();
      wallArtwork[wall].push(object);

      vg.add({
        name: `${wall}Artwork`,
        object: object,
        gui: []
      });
    } catch (error) {
      console.error(`Error loading texture for artwork: ${artwork.image_url}`, error);
    }
  });

  await Promise.all(setupArtworkPromises);

  // Position artwork on walls
  Object.entries(wallArtwork).forEach(([wall, artworks]) => {
    positionArtwork(wall, artworks as THREE.Mesh[], room);
  });
}

function positionArtwork(wall: string, artworks: THREE.Mesh[], room: { width: number, depth: number, height: number }) {
  const floorY = 0;
  const heightAboveFloor = -0.4;
  const artworkYOffset = -1.5;

  const totalWidth = artworks.reduce((sum, art) => sum + art.geometry.parameters.width, 0);
  let startX = -totalWidth / 2;

  artworks.forEach((art) => {
    const width = art.geometry.parameters.width;
    const height = art.geometry.parameters.height;
    const yPosition = floorY + heightAboveFloor + height / 2 + artworkYOffset;

    switch (wall) {
      case 'north':
        art.position.set(startX + width / 2, yPosition, -room.depth / 2 + 0.1);
        art.rotation.y = 0;
        break;
      case 'south':
        art.position.set(startX + width / 2, yPosition, room.depth / 2 - 0.1);
        art.rotation.y = Math.PI;
        break;
      case 'east':
        art.position.set(room.width / 2 - 0.1, yPosition, startX + width / 2);
        art.rotation.y = -Math.PI / 2;
        break;
      case 'west':
        art.position.set(-room.width / 2 + 0.1, yPosition, startX + width / 2);
        art.rotation.y = Math.PI / 2;
        break;
    }

    startX += width;
  });
}
