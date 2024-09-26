import * as THREE from 'three';
import VG from './vg';

export function setupArtwork(vg: VG, textureLoader: THREE.TextureLoader, data: any[], room: { width: number, depth: number, height: number }) {
  const wallArtwork = {
    north: [],
    south: [],
    east: [],
    west: []
  };

  const floorY = 0;
  const zOffset = 0.5;

  data.forEach((artwork) => {
    textureLoader.load(artwork.image_url, (texture) => {
      const aspectRatio = texture.image.width / texture.image.height;
      
      const width = texture.image.width / 100;
      const height = texture.image.height / 100;

      const geometry = new THREE.PlaneGeometry(width, height);
      const material = new THREE.MeshBasicMaterial({ map: texture });
      const object = new THREE.Mesh(geometry, material);

      const wall = artwork.wall.toLowerCase();
      wallArtwork[wall].push(object);

      vg.add({
        name: `${wall}Artwork`,
        object: object,
        gui: []
      });
    });
  });

  // position artwork on walls
  const positionArtwork = (wall, artworks) => {
    const totalWidth = artworks.reduce((sum, art) => sum + art.geometry.parameters.width, 0);
    let startX = 0;

    const heightAboveFloor = -0.4;
    
    const artworkYOffset = -1.5;

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
          art.position.set(room.width / 2 - 0.1, yPosition, startX + width / 2 - room.depth / 2);
          art.rotation.y = -Math.PI / 2;
          break;
        case 'west':
          art.position.set(-room.width / 2 + 0.1, yPosition, startX + width / 2 - room.depth / 2);
          art.rotation.y = Math.PI / 2;
          break;
      }

      startX += width;
    });
  };

  console.log('wallArtwork', wallArtwork);
 
  setTimeout(() => {
    Object.keys(wallArtwork).forEach(wall => positionArtwork(wall, wallArtwork[wall]));
  }, 1000);
}
