// mobile controls setup
export const setupMobileControls = (vg, player) => {
    // check if mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (!isMobile) return;

    // movement buttons setup
    const createMoveButton = (text, position, control) => {
        const button = document.createElement('button');
        button.textContent = text;
        button.style.position = 'fixed';
        button.style.zIndex = '1000';
        button.className = 'movement-button';
        Object.assign(button.style, position);
            
        const startMove = () => { player.touchControls[control] = true; };
        const stopMove = () => { player.touchControls[control] = false; };
            
        button.addEventListener('touchstart', startMove);
        button.addEventListener('touchend', stopMove);
            
        document.body.appendChild(button);
    };

    // create movement buttons
    createMoveButton('↑', { bottom: '120px', left: '50%', transform: 'translateX(-50%)' }, 'forward');
    createMoveButton('↓', { bottom: '40px', left: '50%', transform: 'translateX(-50%)' }, 'backward');
    createMoveButton('←', { bottom: '80px', left: 'calc(50% - 67px)' }, 'left');
    createMoveButton('→', { bottom: '80px', left: 'calc(50% + 20px)' }, 'right');

    // add styles for movement buttons
    const style = document.createElement('style');
    style.textContent = `
        .movement-button {
            width: 50px;
            height: 50px;
            background: rgba(255, 255, 255, 0.3);
            border: 2px solid white;
            border-radius: 25px;
            color: white;
            font-size: 24px;
            touch-action: none;
            user-select: none;
        }
        .movement-button:active {
            background: rgba(255, 255, 255, 0.5);
        }
    `;
    document.head.appendChild(style);

    // create and setup look stick
    const lookStick = document.createElement('div');
    lookStick.className = 'look-stick';
    
    const stick = document.createElement('div');
    stick.className = 'stick';
    lookStick.appendChild(stick);
    
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    
    const handleStart = (e) => {
        isDragging = true;
        const pos = e.type.includes('mouse') ? e : e.touches[0];
        // get the center position of the stick
        const rect = lookStick.getBoundingClientRect();
        startX = rect.left + rect.width / 2;
        startY = rect.top + rect.height / 2;
        stick.style.transition = 'none';
    };
    
    const handleMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        
        const pos = e.type.includes('mouse') ? e : e.touches[0];
        // calculate delta from center
        const deltaX = pos.clientX - startX;
        const deltaY = pos.clientY - startY;
        
        // limit stick movement
        const maxDistance = 30;
        const distance = Math.min(Math.sqrt(deltaX * deltaX + deltaY * deltaY), maxDistance);
        const angle = Math.atan2(deltaY, deltaX);
        
        const stickX = Math.cos(angle) * distance;
        const stickY = Math.sin(angle) * distance;
        
        stick.style.transform = `translate(${stickX}px, ${stickY}px)`;
        
        // apply camera rotation with adjusted sensitivity
        vg.camera.rotation.y -= (deltaX * 0.0002);
        vg.camera.rotation.x -= (deltaY * 0.0002);
        
        // clamp vertical rotation
        vg.camera.rotation.x = Math.max(-Math.PI/3, Math.min(Math.PI/3, vg.camera.rotation.x));
    };
    
    const handleEnd = () => {
        isDragging = false;
        stick.style.transition = 'transform 0.2s';
        stick.style.transform = 'translate(0, 0)';
    };
    
    // add event listeners
    lookStick.addEventListener('mousedown', handleStart);
    lookStick.addEventListener('touchstart', handleStart);
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchend', handleEnd);
    
    document.body.appendChild(lookStick);
    
    // add look stick styles
    const lookStickStyle = document.createElement('style');
    lookStickStyle.textContent = `
        .look-stick {
            position: fixed;
            top: 10%;
            right: 5%;
            transform: translateY(-50%);
            width: 100px;
            height: 100px;
            background: rgba(255, 255, 255, 0.2);
            border: 2px solid white;
            border-radius: 50%;
            touch-action: none;
        }
        .stick {
            position: absolute;
            top: 30%;
            left: 50%;
            width: 40px;
            height: 40px;
            background: rgba(255, 255, 255, 0.5);
            border-radius: 50%;
            transform: translate(-20%, -50%);
            transition: transform 0.2s;
        }
    `;
    document.head.appendChild(lookStickStyle);
}; 