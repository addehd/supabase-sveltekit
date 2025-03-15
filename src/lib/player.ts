import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import type VG from './vg';

export type PlayerConfig = {
  position: {
    x: number;
    y: number;
    z: number;
  };
  look?: {
    x: number;
    y: number;
  };
  room: {
    width: number;
    depth: number;
  };
  onUpdate?: (position: THREE.Vector3) => void;
}

export function setupPlayer(vg: VG, config: PlayerConfig) {
    const body = new CANNON.Body({
      mass: 30,
      shape: new CANNON.Sphere(1),
      linearDamping: 0.9,
      angularDamping: 0.9
    });

    body.position.set(
      config.position.x,
      config.position.y,
      config.position.z
    );

    const object = new THREE.Mesh(
      new THREE.BoxGeometry(1, 3, 2),
      new THREE.MeshBasicMaterial({ color: 0x00ff90 })
    );

    const player = {
      name: 'player',
      body,
      object,
      moveSpeed: 2,
      lookSpeed: 0.1,
      jumpSpeed: 300,
      crouchSpeed: 0.1,
      unremovable: true,
      moveDirection: new THREE.Vector3(),
      keysDown: {},
      touchControls: {},
      update: function(delta) {
        this.moveDirection.set(0, 0, 0);
        if (this.keysDown['s']) this.moveDirection.z -= 1;
        if (this.keysDown['w']) this.moveDirection.z += 1;
        if (this.keysDown['a']) this.moveDirection.x -= 1;
        if (this.keysDown['d']) this.moveDirection.x += 1;
        this.moveDirection.normalize();

        let cameraDirection = new THREE.Vector3();
        vg.camera.getWorldDirection(cameraDirection);
        cameraDirection.y = 0;
        cameraDirection.normalize();
        let sideDirection = new THREE.Vector3(-cameraDirection.z, 0, cameraDirection.x);
        
        let moveImpulse = new CANNON.Vec3(
          (this.moveDirection.x * sideDirection.x + this.moveDirection.z * cameraDirection.x) * this.moveSpeed * delta,
          0,
          (this.moveDirection.x * sideDirection.z + this.moveDirection.z * cameraDirection.z) * this.moveSpeed * delta
        );
        this.body.applyImpulse(moveImpulse);

        // constrain player movement
        this.body.position.x = Math.max(-config.room.width/2 + 1, Math.min(config.room.width/2 - 1, this.body.position.x));
        this.body.position.z = Math.max(-config.room.depth/2 + 1, Math.min(config.room.depth/2 - 1, this.body.position.z));

        this.object.position.copy(this.body.position);
        this.object.quaternion.copy(this.body.quaternion);

        vg.camera.position.copy(this.object.position);
        vg.camera.position.y += 1.2;

        if (!this.initialRotationSet) {
          vg.camera.rotation.x = config.look?.x || 0.31;
          vg.camera.rotation.y = config.look?.y || -0.3;
          this.initialRotationSet = true;
        }

        if (config.onUpdate) {
          config.onUpdate(this.object.position);
        }
      }
    };

    // Setup controls
    ['w', 'a', 's', 'd'].forEach(key => {
      vg.input.onDown[key] = () => { player.keysDown[key] = true; };
      vg.input.onUp[key] = () => { player.keysDown[key] = false; };
    });

    vg.input.onDown[' '] = () => {
      if (Math.abs(player.body.velocity.y) < 0.1) {
        player.body.applyImpulse(new CANNON.Vec3(0, player.jumpSpeed, 0));
      }
    };

    vg.input.whilePressed['Control'] = () => player.body.velocity.y -= player.crouchSpeed;

    // Setup look controls
    vg.camera.rotation.order = "YXZ";
    vg.input.whilePressed['ArrowRight'] = () => { vg.camera.rotation.y -= 0.05 };
    vg.input.whilePressed['ArrowLeft'] = () => { vg.camera.rotation.y += 0.05 };
    vg.input.whilePressed['ArrowDown'] = () => { vg.camera.rotation.x -= 0.02 };
    vg.input.whilePressed['ArrowUp'] = () => { vg.camera.rotation.x += 0.02 };

    vg.add(player);
    vg.cameraTarget = object;

    return player;
} 