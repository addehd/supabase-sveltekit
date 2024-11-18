import { VRButton } from 'three/addons/webxr/VRButton.js';
import * as THREE from 'three';

export const initVR = (vg) => {
    // enable vr for renderer
    vg.renderer.xr.enabled = true;
    
    // add vr button to document
    document.body.appendChild(VRButton.createButton(vg.renderer));
    
    // setup vr camera group
    const cameraGroup = new THREE.Group();
    cameraGroup.position.copy(vg.camera.position);
    cameraGroup.add(vg.camera);
    vg.scene.add(cameraGroup);
    
    // store reference to camera group
    vg.cameraGroup = cameraGroup;
    
    // modify animation loop for vr
    vg.run = function() {
        vg.renderer.setAnimationLoop((time) => {
            const delta = time - (this.lastTime || time);
            this.lastTime = time;
            
            // update physics
            vg.world.fixedStep();
            
            // update all things
            vg.update(delta);
            
            // render scene
            vg.renderer.render(vg.scene, vg.camera);
            
            // update hud if enabled
            if (vg.hudEnabled && typeof vg.hud === 'function') {
                vg.hud(delta);
            }
        });
    };

    // handle vr controller input
    const controller1 = vg.renderer.xr.getController(0);
    const controller2 = vg.renderer.xr.getController(1);
    
    cameraGroup.add(controller1);
    cameraGroup.add(controller2);
    
    // controller event listeners
    controller1.addEventListener('selectstart', onSelectStart);
    controller1.addEventListener('selectend', onSelectEnd);
    
    // vr movement controls
    function onSelectStart(event) {
        // handle vr controller trigger press
        if (vg.player) {
            // example: move forward in direction player is facing
            const direction = new THREE.Vector3();
            vg.camera.getWorldDirection(direction);
            vg.player.body.velocity.x = direction.x * 5;
            vg.player.body.velocity.z = direction.z * 5;
        }
    }
    
    function onSelectEnd(event) {
        // handle vr controller trigger release
        if (vg.player) {
            vg.player.body.velocity.x = 0;
            vg.player.body.velocity.z = 0;
        }
    }
    
    // handle vr session start/end
    vg.renderer.xr.addEventListener('sessionstart', () => {
        console.log('vr session started');
    });
    
    vg.renderer.xr.addEventListener('sessionend', () => {
        console.log('vr session ended');
    });
}